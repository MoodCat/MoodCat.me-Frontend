'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:ClassifyCtrl
 * @description
 * # ClassifyCtrl
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
            };
        }
    ])
  .controller('ClassifyCtrl', ['$scope', 'classifySongService', 'songs', 'currentSongService', '$timeout', '$rootScope',
        function ($scope, classifySongService, songs, currentSongService, $timeout, $rootScope) {
            $scope.songs = songs;

            var timeout;

            // When the SAMs are hidden, we have to refresh our list.
            $scope.$watch('feedbackSAM', function(newValue, oldValue) {
                if (newValue !== oldValue && !newValue) {
                    classifySongService.getSongs().then(function(response) {
                        $scope.songs = response;
                        $timeout.cancel(timeout);
                        currentSongService.stop();
                        $scope.activeSong = null;
                    });
                }
            });

          $scope.loadForClassify = function loadForClassify(song) {
              var duration = Math.min(song.duration / 4.0, 30) * 1000;

              currentSongService.loadSong(song.soundCloudId, duration);
              $scope.activeSong = song;
              $rootScope.feedbackSAM = true;

              timeout = $timeout(function() {
                  $rootScope.sound.stop();
              }, duration);
          };
      }
  ]);
