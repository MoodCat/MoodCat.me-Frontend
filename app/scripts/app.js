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
    .controller('AudioCtrl', function($scope, ngAudio) {
      $scope.sound = ngAudio.load("song.mp3");
      $scope.sound.title = "Fall Out Boy - Centuries";
    });
