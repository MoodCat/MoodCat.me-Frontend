'use strict';

angular.module('moodCatApp')
  .controller('PointsCtrl', ['PointsService', '$scope', '$interval', function(PointsService, $scope, $interval) {

      var that = this;

      /**
       * The points of a user.
       */
      this.points = 0;

      /**
       * Retrieves the points of the current user.
       */
      this.fetchPoints = function() {
          PointsService.getPoints().then(function(points) {
              that.points = points;
          });
      };

      // Queries the API for a point update every second.
      var interval = $interval(this.fetchPoints, 100000);


      // If the user logs in, start the querying for updates.
      $scope.$on('soundcloud-login', this.fetchPoints);

      // Fetch points when we expect new points
      $scope.$on('fetch-points', this.fetchPoints);

      // If the controller is destroyed, cancel the updating of points.
      $scope.$on('$destroy', $interval.cancel.bind($interval, interval));

      // Fetch points on creation of this controller.
      this.fetchPoints();

  }]);
