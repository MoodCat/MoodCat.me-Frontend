'use strict';

angular.module('moodCatUtil', []);
angular.module('moodCatAudio', ['ngAudio', 'moodCatUtil']);

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
    'ct.ui.router.extras.sticky',
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'timer',
    'moodCatAudio',
    'moodCatUtil'
  ])
  .config(function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('room', {
          url : '/room/{roomId:[0-9]{1,8}}',
          templateUrl : 'views/room.html',
          resolve : {
    	    room : ['$stateParams', 'roomService', function($stateParams, roomService) {
              return roomService.fetchRoom($stateParams.roomId).then(function(room) {
                return roomService.switchRoom(room);
              });
            }],
            messages : ['$stateParams', 'chatService', function($stateParams, chatService) {
              return chatService.fetchMessages($stateParams.roomId);
            }]
          },
          controller : 'roomController'
        })
        .state('moods.rooms', {
          url : '/room/select?mood',
          templateUrl : 'views/selectRoom.html',
          resolve : {
            rooms : ['$stateParams', 'roomService', 'soundCloudService', '$q', function($stateParams, roomService, soundCloudService, $q) {
              return roomService.fetchRooms($stateParams.mood).then(function(rooms) {
                return $q.all(rooms.map(function(room) {
                  return room;
                }));
              });
            }]
          },
          controller : 'selectRoomController'
        })
        .state('moods', {
          url : '/moods',
          sticky: true,
          templateUrl : 'views/moodSelection.html',
          resolve: {
            moods: ['moodService', function(moodService) {
              return moodService.getMoods();
            }]
          },
          controller : 'moodCtrl'
        })
        .state('home', {
          url : '/',
          templateUrl : 'views/moodSelection.html',
          resolve: {
            moods: ['moodService', function(moodService) {
              return moodService.getMoods();
            }]
          },
          controller : 'moodCtrl'
        })
        .state('about', {
          url : '/about',
          templateUrl : 'views/about.html',
          controller : 'AboutCtrl'
        })
        .state('leaderboard', {
          url : '/leaderboard',
          templateUrl : 'views/leaderboard.html',
          resolve: {
            board: ['moodcatBackend', function(moodcatBackend) {
              return moodcatBackend.get('/api/users/leaderboard');
            }]
          },
          controller : 'LeaderBoardCtrl',
          controllerAs : 'leaderBoardController'
        })
        .state('classify', {
          url : '/classify',
          templateUrl : 'views/classify.html',
          resolve : {
              songs: ['classifySongService', function(classifySongService) {
                  return classifySongService.getSongs();
              }]
          },
          controller : 'ClassifyCtrl'
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
