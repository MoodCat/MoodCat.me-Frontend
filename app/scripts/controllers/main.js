'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
  .service('roomService', [
    'moodcatBackend',
    '$rootScope',
    'currentSongService',
    '$log',
    function(moodcatBackend, $rootScope, currentSongService, $log) {

      this.fetchRooms = function fetchRoom(moods) {
        return moodcatBackend.get('/api/rooms/', {
          params: {
            mood : moods
          }
        });
      };

      this.fetchRoom = function fetchRoom(roomId) {
        return moodcatBackend.get('/api/rooms/' + roomId);
      };

      this.fetchNowPlaying = function fetchNowPlaying(roomId) {
        return moodcatBackend.get('/api/rooms/' + roomId + '/now-playing');
      };

      this.switchRoom = function switchRoom(room) {
        if(!room) return;
        if(!$rootScope.room || $rootScope.room.id != room.id) {
          $rootScope.room = room;
          currentSongService.loadSong(room.nowPlaying.song.soundCloudId, room.nowPlaying.time / 1000);
          $log.info("Joining room %s", room.name);
          $rootScope.feedbackSAM = false;
        }
        return room;
      }

      setInterval((function() {
        if(!$rootScope.room || $rootScope.sound && $rootScope.sound.paused) return;
        this.fetchNowPlaying($rootScope.room.id).then(function(nowPlaying) {
          if($rootScope.song.id !== nowPlaying.song.soundCloudId) {
            currentSongService.loadSong(nowPlaying.song.soundCloudId);
          }
          var currentTime = Math.round($rootScope.sound.currentTime * 1000);

          if(Math.abs(currentTime - nowPlaying.time) > 1000) {
            $rootScope.sound.setCurrentTime(nowPlaying.time / 1000);
          }
        })
      }).bind(this), 1000);

      this.callNextSong = function callNextSong(room) {

        if((room.song.duration/1000 - currentSongService.getTime()) < 1){
          this.fetchNowPlaying(room.id).then(function(data) {
             room.nextSong = data.song.soundCloudId;
             currentSongService.loadSong(room.nextSong);
             room.song = room.nextSong;
           });
        }

        setTimeout(callNextSong, 1000, room);
     };
    }
  ])
  .service('chatService', ['moodcatBackend', '$log', 'SoundCloudService', function(moodcatBackend, $log, SoundCloudService) {

    this.sendChatMessage = function(mess, roomId) {
      return moodcatBackend.post('/api/rooms/' + roomId + '/messages', angular.toJson(mess), {
        params: {
          token : SoundCloudService.getToken()
        }
      });
    }

    this.fetchMessages = function(roomId) {
      $log.info('Fetched messages for chat %s', roomId);
      return moodcatBackend.get('/api/rooms/' + roomId + '/messages');
    }

  }])
  .service('moodService', ['$log', 'moodcatBackend', function($log, moodcatBackend) {
    this.getMoods = function() {
      $log.info('Fetching moods from API');
      return moodcatBackend.get('/api/moods/');
    }
  }])
  .controller('moodCtrl', function ($q, $scope, $timeout, $state, soundCloudService, moodService, moods) {
    $scope.moods = moods;

    angular.forEach($scope.moods, function(mood) {
         mood.enabled = false;
    });

    $scope.getSelectedMoods = function getSelectedMoods() {
      return $scope.moods.filter(function(mood) {
        return mood.enabled;
      }).map(function(mood) {
        return mood.name;
      });
    }

    $scope.submitMoods = function() {
      var moods = $scope.getSelectedMoods();
      if(moods.length) {
        var mood = moods[0].toLowerCase();
        angular.element('body').css('background-image', 'url(http://moodcat.me/mood-bg/' + mood + ')');
        $state.go('moods.rooms', { mood: moods });
      }
    };

  })
  .controller('selectRoomController', ['$scope', 'roomService', 'rooms', '$state', function($scope, roomService, rooms, $state) {

    $scope.rooms = rooms;

    $scope.switchRoom = function switchRoom(room) {
      roomService.switchRoom(room);
      $state.go('room', {
        roomId : room.id
      });
    };

  }])
  .controller('roomController', function($scope, $timeout, chatService, messages) {

      $scope.messages = messages;

      $scope.chatMessage = {
        message: ''
      };

      $scope.addMessage = function() {
        // TODO login check
        if ($scope.chatMessage.message === '') {
            return;
        }

        //Send the mesage to the server
        chatService.sendChatMessage($scope.chatMessage, $scope.room.id).then(function(res) {
          $scope.messages.push(res);
        });

        //Clear the chat input field
        $scope.chatMessage.message = '';

        $timeout(function() {
          var list = angular.element('#chat-messages-list')[0];
          list.scrollTop = list.scrollHeight;
        })
      }
  })
  .directive('fallbackSrc', function () {
    return{
      link: function postLink(scope, element, attrs) {
        element.bind('error', function () {
          angular.element(this).attr('src', attrs.fallbackSrc);
        });
      }
    }
  });
