'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
  .service('roomService', function($http) {
    this.fetchRooms = function(moods) {
        var url = '/api/rooms/?';
        angular.forEach(moods, function(mood) {
          url += 'mood=' + mood + '&';
        }, url);
      return $http.get(url);
    }

   this.fetchRoom = function(roomId) {
      return $http.get('/api/rooms/' + roomId);
    }
  })
  .service('chatService', function($http, $log) {

    this.sendChatMessage = function(mess, roomId) {
      var request = $http.post('/api/rooms/' + roomId + '/messages', angular.toJson(mess));
      // Store the data-dump of the FORM scope.
      request.success(
        function(response) {
          $log.info("Received response %o", response);
        }
      );

      request.error($log.warn.bind($log, "Failed to fetch response"));
    }

    this.fetchMessages = function(roomId) {
      $log.info("Fetched messages for chat %s", roomId);
      return $http.get('/api/rooms/' + roomId + '/messages');
    }

  })
  .service('moodService', function($http, $log) {
    this.getMoods = function() {
      $log.info("Fetching moods from API");
      return $http.get('/mocks/moods.json');
    }
  })
  .controller('moodCtrl', function ($q, $scope, $timeout, $state, soundCloudService, moodService, roomService, chatService) {
    $scope.selectedMoods = [];

    moodService.getMoods().success(function(data) {
      $scope.moods = data;
    });

    $scope.submitMoods = function() {
        var encodedmoods = '';
        angular.forEach($scope.moods, function(mood) {
            if(mood.enabled) {
                encodedmoods += mood.value + '-';
            }
        }, encodedmoods);
        encodedmoods = encodedmoods.toLowerCase().slice(0, -1);
        $state.go('selectRoom', {moods: encodedmoods});
    };

  })
  .controller('selectRoomController', function($rootScope, $q, $scope, $timeout, soundCloudService, room) {
      $scope.rooms = [];

      $q.all(room.data.map(function(room) {
        room.timeLeft = room.song.duration - room.time;
        return soundCloudService
          .fetchMetadata(room.song.soundCloudId)
          .success(function(data) {
            room.data = data;
            return room;
          })
      })).then(function() {
        $scope.rooms = room.data;
        //$rootScope.activeRoom = $scope.rooms[0];
      });
  })
  .controller('roomController', function($rootScope, $scope, $timeout, chatService, room, messages) {
      $scope.room = room.data;
      $scope.messages = messages.data;

      $scope.chatMessage = {
        message: "",
        author: "System"
      };

      $rootScope.activeRoom = $scope.room;
      $scope.loadSong($scope.room.song.soundCloudId);

      $scope.addMessage = function() {
          if ($scope.chatMessage.message === "") {
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
        $scope.chatMessage.message = "";

        $timeout(function() {
          var list = angular.element("#chat-messages-list")[0];
          list.scrollTop = list.scrollHeight;
        })
      }
  })
  .directive('fallbackSrc', function () {
    return{
      link: function postLink(scope, element, attrs) {
        element.bind('error', function () {
          angular.element(this).attr("src", attrs.fallbackSrc);
        });
      }
    }
  });
