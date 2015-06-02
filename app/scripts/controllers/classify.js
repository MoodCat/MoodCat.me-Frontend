'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
    .service('classifySongService', [
        '$http',
        function($http) {
            this.getSongs = function getSongs() {
                return $http.get('/api/songs/toclassify').then(function(response) {
                  return response.data;
                });
            }
        }
    ])
  .controller('ClassifyCtrl', ['$scope', 'classifySongService', 'songs', 'currentSongService', '$timeout', '$rootScope',
        function ($scope, classifySongService, songs, currentSongService, $timeout, $rootScope) {
      $scope.songs = songs;

      $scope.loadForClassify = function loadForClassify(song) {
          currentSongService.loadSong(song.soundCloudId);
          $scope.activeSong = song;
          $rootScope.feedbackSAM = true;

          $timeout(function() {
              $rootScope.sound.stop();
          },
          // We will let the user listen to 25% of the song.
          (song.duration * 1000) / 4);
      }
  }
  ]);
