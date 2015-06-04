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
              currentSongService.loadSong(song.soundCloudId);
              $scope.activeSong = song;
              $rootScope.feedbackSAM = true;

              timeout = $timeout(function() {
                  $rootScope.sound.stop();
              },
              // We will let the user listen to 25% of the song, but maximally 30 seconds.
              Math.min(song.duration / 4.0, 30) * 1000);
          };
      }
  ]);
