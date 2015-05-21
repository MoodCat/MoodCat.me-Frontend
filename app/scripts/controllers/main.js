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
      //return $http.get('/mocks/rooms.json');
    }
  })
  .service('chatService', function($http, $log) {
    this.sendChatMessage = function(mess) {

      var request = $http.post('/api/rooms/1/messages', angular.toJson(mess));
      // Store the data-dump of the FORM scope.
      request.success(
        function(response) {
          $log.info("Received response %o", response);
        }
      );
      request.error($log.warn.bind($log, "Failed to fetch response"));
    }
  })
  .controller('MainCtrl', function ($q, $scope, $timeout, soundCloudService, roomService, chatService) {
    $scope.moods = ['Angry', 'Nervous', 'Exiting', 'Happy', 'Pleasing', 'Relaxing',
      'Peaceful', 'Calm', 'Sleepy', 'Bored', 'Sad'];

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
        $scope.activeRoom = $scope.rooms[0];
      });
    });

    /**
     * Sets the activeRoom of the user to the given room.
     * Also loads the song of that room and syncs the time.
     * @param {[type]} room [The ID of the room]
     */
    $scope.selectRoom = function selectRoom(room) {
      $scope.activeRoom = room;
      $scope.loadSong(room.song.soundCloudId);
    }

    /** CHAT **/

    $scope.messages = ['Hoihoi!'].map(function(message) {
      return {
        author: "Jan-Willem",
        message: message,
        time: (new Date()).valueOf()
      }
    });

    $scope.chatMessage = {
      message: "",
      author: "System"
    };

    $scope.addMessage = function() {
      var message = {
        message: $scope.chatMessage.message,
        author: $scope.chatMessage.author,
        roomId: 1
      };

      //Add the message to the local queue
      $scope.messages.push(message);

      //Send the mesage to the server
      chatService.sendChatMessage(message);

      //Clear the chat input field
      $scope.chatMessage.message = "";

      $timeout(function() {
        var list = angular.element("#chat-messages-list")[0];
        list.scrollTop = list.scrollHeight;
      })
    }

  });
