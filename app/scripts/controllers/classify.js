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
        'moodcatBackend',
        function(moodcatBackend) {
            this.getSongs = function getSongs() {
                return moodcatBackend.get('/api/songs/toclassify');
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
                        $scope.song = null;
                    });
                }
            });

          $scope.loadForClassify = function loadForClassify(song) {
              var duration = Math.min(song.duration / 4.0, 30) * 1000;

              currentSongService.loadSong(song.soundCloudId, duration);
              $rootScope.song = song;
              $rootScope.feedbackSAM = true;

              timeout = $timeout(function() {
                  $rootScope.sound.stop();
              }, duration);
          };
      }
  ]);
