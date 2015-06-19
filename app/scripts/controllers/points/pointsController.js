'use strict';

angular.module('moodCatApp')
  .controller('PointsCtrl', ['PointsService', '$scope', '$interval', function(PointsService, $scope, $interval) {

      /**
       * The points of a user.
       */
      this.points = 0;

      /**
       * Retrieves the points of the current user.
       */
      this.fetchPoints = function() {
          PointsService.getPoints().then((function(points) {
              this.points = points;
          }).bind(this));
      };

      // Queries the API for a point update every second.
      var interval = $interval(this.fetchPoints.bind(this), 1000);

      // If the user logs in, start the querying for updates.
      $scope.$on('soundcloud-login', this.fetchPoints.bind(this));

      // If the controller is destroyed, cancel the updating of points.
      $scope.$on('$destroy', $interval.cancel.bind($interval, interval));

      // Fetch points on creation of this controller.
      this.fetchPoints();

  }]);
