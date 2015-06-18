'use strict';

angular.module('moodCatApp')
  .controller('PointsCtrl', ['PointsService', '$scope', '$interval', function(PointsService, $scope, $interval) {

      /**
       * The points of a user.
       */
      this.points = 0;

      this.fetchPoints = function() {
          PointsService.getPoints().then((function(points) {
              this.points = points;
          }).bind(this));
      };

      var interval = $interval(this.fetchPoints.bind(this), 1000);
      $scope.$on('soundcloud-login', this.fetchPoints.bind(this));
      $scope.$on('$destroy', $interval.cancel.bind($interval, interval));
      this.fetchPoints();

  }]);
