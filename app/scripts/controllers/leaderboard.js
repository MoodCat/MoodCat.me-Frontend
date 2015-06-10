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
            $scope.points = 0;

            $rootScope.$watch('loggedIn', function(newValue, oldValue) {
                if (newValue !== oldValue && newValue) {
                    PointsService.getPoints().then(function(response) {
                        $scope.points = response.data;
                    });
                }
            });

            this.getBoard = function getBoard() {
                $http.get('/api/users/leaderboard').then(function(response) {
                    $scope.board = response.data;
                });
            }
            this.getBoard();

        }
    ]);
