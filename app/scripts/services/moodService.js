'use strict';

angular.module('moodCatApp')
  .service('moodService', ['$log', 'moodcatBackend', function($log, moodcatBackend) {
    this.getMoods = function() {
      $log.info('Fetching moods from API');
      return moodcatBackend.get('/api/moods/');
    };
}]);
