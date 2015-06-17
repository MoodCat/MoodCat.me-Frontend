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

          $scope.loadForClassify = function loadForClassify(song) {
              var duration = Math.min(song.duration / 4.0, 30) * 1000;

              currentSongService.loadSong(song.soundCloudId, duration);
              $rootScope.song = song;
              $scope.feedbackSAM = true;

              timeout = $timeout(function() {
                  $rootScope.sound.stop();
              }, duration);

              var elem = angular.element('<feedback-sam/>');
              elem.insertAfter($element.find('#classify-song-list'));
              $compile(elem)($scope);

          };
      }
  ]);
