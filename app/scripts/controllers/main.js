'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
  .controller('MainCtrl', function ($scope, $timeout, soundCloudService) {
    $scope.moods = ['Angry', 'Nervous', 'Exiting', 'Happy', 'Pleasing', 'Relaxing',
      'Peaceful', 'Calm', 'Sleepy', 'Bored', 'Sad'];

    $scope.rooms = [];

    soundCloudService.fetchMetadata("202846566").success(function(data) {
      $scope.rooms = ['Copperhead Toads', 'Macho Junkers', 'Long Cat Force', 'Damaged Bush Supernovas',
        'Spinning Rag Razors', 'Sweeping Blank Cicadas', 'Silver Ass Wankers', 'The Swamp Epidemic',
        'The Dope Samaritans', 'Silver Milk Dribblers', 'Great Surf Flux', 'Los Caviar Roosters',
        'Seaview Purple Patsies'].map(function (name) {
          return {
            name: name,
            song: data
          }
        });
      $scope.activeRoom = $scope.rooms[0];
    })

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
