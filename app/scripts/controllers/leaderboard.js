'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:LeaderBoardCtrl
 * @description
 * # LeaderBoardCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
    .controller('LeaderBoardCtrl', ['$http', '$scope', '$timeout', '$rootScope', 'PointsService',
        function($http, $scope, $timeout, $rootScope, PointsService) {
            /**
             * The points of a user.
             */
            $scope.points = 0;

            //When a user is loggedIn we need to fetch te points.
            $rootScope.$watch('loggedIn', function(newValue, oldValue) {
                if (newValue !== oldValue || newValue) {
                    PointsService.getPoints().then(function(response) {
                        $scope.points = response.data;
                    });
                }
            });

            /**
             * Gets the leaderboard from the backend.
             */
            this.getBoard = function getBoard() {
                $http.get('/api/users/leaderboard').then(function(response) {
                    $scope.board = response.data;
                });
            }
            this.getBoard();

        }
    ]);
