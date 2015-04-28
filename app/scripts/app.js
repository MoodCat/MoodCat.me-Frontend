'use strict';

/**
 * @ngdoc overview
 * @name moodCatApp
 * @description
 * # moodCatApp
 *
 * Main module of the application.
 */
angular
  .module('moodCatApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'moodCatAudio'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });



  angular.module('moodCatAudio', ['ngAudio'])
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
