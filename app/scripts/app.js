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
      'ui.router',
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'timer',
    'moodCatAudio'
  ])
  .config(function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('room', {
          url : '/room/:roomId',
          templateUrl : 'views/room.html',
          resolve : {
	    room : ['$stateParams', 'roomService', function($stateParams, roomService) {
              return roomService.fetchRoom($stateParams.roomId);
            }],
            messages : ['$stateParams', 'chatService', function($stateParams, chatService) {
              return chatService.fetchMessages($stateParams.roomId);
            }]
          }, 
          controller : 'roomController'
        })
        .state('selectRoom', {
          url : '/selectRoom',
          templateUrl : 'views/selectRoom.html',
          controller : 'selectRoomController'
        })
        .state('moodSelection', {
          url : '/selectMood',
          templateUrl : 'views/moodSelection.html',
          controller : 'moodCtrl'
        })
        .state('home', {
          url : '/',
          templateUrl : 'views/moodSelection.html',
          controller : 'moodCtrl'
        })
        .state('about', {
          url : '/about',
          templateUrl : 'views/about.html',
          controller : 'AboutCtrl'
        })
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
