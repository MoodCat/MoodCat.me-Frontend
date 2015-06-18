'use strict';

angular.module('moodCatUtil', []);
angular.module('moodCatAudio', ['ngAudio', 'moodCatUtil']);

angular.module('moodCatApp', [
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
          rooms : ['$stateParams', 'roomService', function($stateParams, roomService) {
            return roomService.fetchRooms($stateParams.mood);
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
      });
  })
  .filter('highres', function() {
    return function(input) {
      return input ? input.replace('-large', '-t500x500') : input;
    };
  });
