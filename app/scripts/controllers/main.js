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
    this.fetchRooms = function() {
      return $http.get('/api/rooms/');
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
  .controller('moodCtrl', function ($q, $scope, $timeout, soundCloudService, roomService, chatService) {
    $scope.moods = ['Angry', 'Nervous', 'Exciting', 'Happy', 'Pleasing', 'Relaxing',
      'Peaceful', 'Calm', 'Sleepy', 'Bored', 'Sad'];

  })
  .controller('selectRoomController', function($rootScope, $q, $scope, $timeout, soundCloudService, roomService) {
      $scope.rooms = [];

      roomService.fetchRooms().success(function(rooms) {
        return  $q.all(rooms.map(function(room) {
          room.timeLeft = room.song.duration - room.time;
          return soundCloudService
            .fetchMetadata(room.song.soundCloudId)
            .success(function(data) {
              room.data = data;
              return room;
            })
        })).then(function() {
          $scope.rooms = rooms;
          $rootScope.activeRoom = rooms[0];
        });
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
  });
