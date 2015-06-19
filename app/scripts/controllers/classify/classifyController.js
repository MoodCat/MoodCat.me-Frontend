'use strict';

angular.module('moodCatApp')
  .controller('ClassifyCtrl', ['$scope', '$element', '$compile', 'classifySongService', 'songs', 'currentSongService', '$timeout', '$rootScope',
        function ($scope, $element, $compile, classifySongService, songs, currentSongService, $timeout, $rootScope) {

            $scope.songs = songs;

            var timeout;

            // When the SAMs are hidden, we have to refresh our list.
            $scope.$on('classification-end', function afterClassification() {
                console.log('classification-end!');
                classifySongService.getSongs().then(function(songs) {
                    $scope.songs = songs;
                    $timeout.cancel(timeout);
                    currentSongService.stop();
                    $rootScope.song = null;
                    $scope.feedbackSAM = false;
                });
            });

          /**
           * Loads the given song, and set it to play for 30 seconds.
           * Also enables the feedbackSAM dialog.
           * @param {int} song The song ID to load for classification.
           */
          $scope.loadForClassify = function loadForClassify(song) {
              var duration = Math.min(song.duration / 4.0, 30) * 1000;

              currentSongService.loadSong(song.soundCloudId, duration);
              $rootScope.song = song;
              $scope.feedbackSAM = true;

              timeout = $timeout(function() {
                  if($rootScope.sound) {
                      $rootScope.sound.stop();
                  }
              }, duration);

              var elem = angular.element('<feedback-sam/>');
              elem.insertAfter($element.find('#classify-song-list'));
              $compile(elem)($scope);

          };
      }
  ]);
