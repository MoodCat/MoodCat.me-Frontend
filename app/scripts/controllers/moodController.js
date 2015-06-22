'use strict';

angular.module('moodCatApp')
  .controller('moodCtrl', function ($q, $scope, $timeout, $state, soundCloudService, moodService, moods) {

    /**
     * The moods a user can select
     */
    $scope.moods = moods;

    /**
     * Initialize every mood without enabling it, forcing the user to make the choice.
     */
    angular.forEach($scope.moods, function(mood) {
         mood.enabled = false;
    });

    /**
     * Checks if one or more moods are selected and enables next accordingly.
     */
    $scope.hasSelectedMoods = function hasSelectedMoods() {
      return $scope.moods.some(function(e) {return e.enabled; });
    };

    /**
     * Retrieves the moods the user chose, and return their names.
     */
    $scope.getSelectedMoods = function getSelectedMoods() {
      return $scope.moods.filter(function(mood) {
        return mood.enabled;
      }).map(function(mood) {
        return mood.name;
      });
    };

    /**
     * Retrieves selected moods.
     * If one or more are selected, load a background based on the first one,
     * and transition to the room selection state, passing on the chosen moods.
     */
    $scope.submitMoods = function() {
      var moods = $scope.getSelectedMoods();
      if(moods.length) {
        var mood = moods[0].toLowerCase();
        angular.element('body').css('background-image', 'url(http://moodcat.me/mood-bg/' + mood + ')');
        $state.go('rooms', { mood: moods });
      }
    };

});
