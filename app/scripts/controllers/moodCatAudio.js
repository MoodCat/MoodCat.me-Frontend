'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:AudioCtrl
 * @description
 * # AudioCtrl
 * Controller of the audio of moodcat
 */
 angular.module('moodCatAudio')
   .value('soundCloudKey', '68d16250d1ef387ae1000e9102a23ddb')
   .value('track', '202330997')
   .controller('AudioCtrl', ['$scope', 'ngAudio', 'soundCloudKey', 'track', '$http', function($scope, ngAudio, soundCloudKey, track, $http) {
      $scope.unloadSong = function() {
         //console.log(typeof($scope.sound));
        if (typeof $scope.sound !== 'undefined' && $scope.sound !== null) {
          $scope.sound.stop();
          $scope.sound.unbind();
        }
     };

      $scope.metaData = function(trackID) {
         var promise = $http.get('https://api.soundcloud.com/tracks/'+trackID+'?client_id='+soundCloudKey);

         // Works Async, so the title will be set when it'll be set.
         // No waiting for slow JSON responses
         return promise.then(
            function(payload) {
               $scope.sound.title = payload.data.title;
               console.log(payload.data.title);
            }
         );
      };

      $scope.loadSong = function(trackID) {
         var sound = null;

         // Unloads old song, saving some clientside RAM
         // and preventing old songs from playing
         $scope.unloadSong();
         $scope.metaData(trackID);
         // Load NgAudioObject with specified path
         sound = ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);

         $scope.sound = sound;

      };

     $scope.loadSong(track);
   }]);
