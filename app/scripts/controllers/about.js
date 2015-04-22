'use strict';

/**
 * @ngdoc function
 * @name vagrantApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the vagrantApp
 */
angular.module('vagrantApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
