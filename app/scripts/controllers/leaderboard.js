'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:LeaderBoardCtrl
 * @description
 * # LeaderBoardCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
  .controller('PointsCtrl', ['PointsService', '$scope', function(PointsService, $scope) {

      /**
       * The points of a user.
       */
      this.points = 0;

      this.fetchPoints = function() {
          PointsService.getPoints().then((function(points) {
              this.points = points;
          }).bind(this));
      };

      $scope.$on('soundcloud-login', this.fetchPoints.bind(this));
      this.fetchPoints();

  }])
  .controller('LeaderBoardCtrl', ['board',
    function(board) {
        this.board = board;
    }
  ]);
