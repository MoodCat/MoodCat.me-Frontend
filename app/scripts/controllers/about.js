'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the moodCatApp
 */
angular.module('moodCatApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
