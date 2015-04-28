'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:AudioCtrl
 * @description
 * # AudioCtrl
 * Controller of the audio of moodcat
 */
 angular.module('moodCatAudio')
   .value("soundCloudKey", "68d16250d1ef387ae1000e9102a23ddb")
   .value("track", "202330997")
   .controller('AudioCtrl', ["$scope", "ngAudio", "soundCloudKey", "track", "$http", function($scope, ngAudio, soundCloudKey, track, $http) {
     $scope.loadSong = function(trackID) {
       if (typeof($scope.sound) !== 'undefined') {
         $scope.sound.stop();
         $scope.sound.unbind();
       }
       $http.get('https://api.soundcloud.com/tracks/'+trackID+'?client_id='+soundCloudKey).success(function(data, status, headers, config) {
         console.log(JSON.stringify(data.title));
         console.log(JSON.stringify('Song will play for  ' + data.duration + 'ms'));
         var sound = ngAudio.load("https://api.soundcloud.com/tracks/"+trackID+"/stream?client_id="+soundCloudKey);
         sound.title = data.title;
         $scope.sound = sound;
         $scope.sound.play();
       });
     }

     $scope.loadSong(track);

   }]);
