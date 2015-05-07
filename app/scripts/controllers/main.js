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
      return $http.get('/mocks/rooms.json');
    }
  })
  .controller('MainCtrl', function ($q, $scope, $timeout, soundCloudService, roomService) {
    $scope.moods = ['Angry', 'Nervous', 'Exiting', 'Happy', 'Pleasing', 'Relaxing',
      'Peaceful', 'Calm', 'Sleepy', 'Bored', 'Sad'];

    $scope.rooms = [];


    roomService.fetchRooms().success(function(rooms) {
      return  $q.all(rooms.map(function(room) {
        return soundCloudService
          .fetchMetadata(room.songId)
          .success(function(data) {
            room.song = data;
            return room;
          })
      })).then(function() {
        $scope.rooms = rooms;
        $scope.activeRoom = $scope.rooms[0];
      });
    });

    $scope.messages = ['Hoihoi!'].map(function(message) {
      return {
        author: "Jan-Willem",
        message: message,
        time: (new Date()).valueOf()
      }
    });

    $scope.chatMessage = {
      message: "",
      author: "Eva"
    };

    $scope.addMessage = function() {
      $scope.messages.push({
        message: $scope.chatMessage.message,
        author: $scope.chatMessage.author,
        time: (new Date()).valueOf()
      });
      $scope.chatMessage.message = "";

      $timeout(function() {
        var list = angular.element("#chat-messages-list")[0];
        list.scrollTop = list.scrollHeight;
      })
    }

    $scope.selectRoom = function selectRoom(room) {
      $scope.activeRoom = room;
      $scope.audioCtrl.loadSong(room.song.id);
    }

  });
