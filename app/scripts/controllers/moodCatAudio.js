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
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
      $scope.unloadSong = function() {
         console.log(typeof($scope.sound));
        if (typeof($scope.sound) !== 'undefined') {
          $scope.sound.stop();
          $scope.sound.unbind();
        }
     }
     $scope.loadSong = function(trackID) {
        $scope.unloadSong();

        //var data = getMetaData(trackID);
       $http.get('https://api.soundcloud.com/tracks/'+trackID+'?client_id='+soundCloudKey).success(function(data, status, headers, config) {
         var sound = ngAudio.load("https://api.soundcloud.com/tracks/"+trackID+"/stream?client_id="+soundCloudKey);
         sound.title = data.title;
         $scope.sound = sound;
         $scope.sound.play();
       });
     }

     $scope.loadSong(track);
   }]);
