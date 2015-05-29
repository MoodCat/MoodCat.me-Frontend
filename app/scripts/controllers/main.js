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
    '$http',
    '$rootScope',
    'currentSongService',
    '$log',
    function($http, $rootScope, currentSongService, $log) {

      this.fetchRooms = function fetchRoom(moods) {
        var url = '/api/rooms/';
        return $http.get(url, {
          params: {
            mood : moods
          }
        }).then(function(response) {
          return response.data;
        });
      }

      this.fetchRoom = function fetchRoom(roomId) {
        return $http.get('/api/rooms/' + roomId).then(function(response) {
          return response.data;
        });
      }

      this.switchRoom = function switchRoom(room) {
        if(!room) return;
        if(!$rootScope.room || $rootScope.room.id != room.id) {
          $rootScope.room = room;
          currentSongService.loadSong(room.song.soundCloudId);
          $log.info("Joining room %s", room.name);
        }
        return room;
      }
    }
  ])
  .service('chatService', function($http, $log) {

    this.sendChatMessage = function(mess, roomId) {
      var request = $http.post('/api/rooms/' + roomId + '/messages', angular.toJson(mess));
      // Store the data-dump of the FORM scope.
      request.success(
        function(response) {
          $log.info('Received response %o', response);
        }
      );

      request.error($log.warn.bind($log, 'Failed to fetch response'));
    }

    this.fetchMessages = function(roomId) {
      $log.info('Fetched messages for chat %s', roomId);
      return $http.get('/api/rooms/' + roomId + '/messages').then(function(response) {
        return response.data;
      });
    }

  })
  .service('moodService', function($http, $log) {
    this.getMoods = function() {
      $log.info('Fetching moods from API');
      return $http.get('/mocks/moods.json').then(function(response) {
        return response.data;
      });
    }
  })
  .controller('moodCtrl', function ($q, $scope, $timeout, $state, soundCloudService, moodService, moods) {
    $scope.moods = moods;

    $scope.getSelectedMoods = function getSelectedMoods() {
      return $scope.moods.filter(function(mood) {
        return mood.enabled;
      }).map(function(mood) {
        return mood.value;
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
        message: '',
        author: 'System'
      };

      $scope.addMessage = function() {
          if ($scope.chatMessage.message === '') {
              return;
          }

        var message = {
          message: $scope.chatMessage.message,
          author: $scope.chatMessage.author
        };

        //Add the message to the local queue
        $scope.messages.push(message);

        //Send the mesage to the server
        chatService.sendChatMessage(message, $scope.room.id);

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
