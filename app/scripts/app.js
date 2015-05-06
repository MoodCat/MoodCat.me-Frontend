'use strict';

angular.module('moodCatAudio', ['ngAudio']);

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
    'timer',
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
