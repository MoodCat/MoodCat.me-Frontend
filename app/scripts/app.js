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
    'moodCatAudio',
    'ui.router'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/moodSelection.html',
        controller: 'moodCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .filter('orderByProperty', function(){
    return function(input, attribute) {
      if (!angular.isObject(input)) return input;

      var array = [];
      for(var objectKey in input) {
          array.push(input[objectKey]);
      }

      array.sort(function(a, b){
          a = parseInt(a[attribute]);
          b = parseInt(b[attribute]);
          return a - b;
      });
      return array;
    }
  });
