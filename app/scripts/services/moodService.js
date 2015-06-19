'use strict';

angular.module('moodCatApp')
  .service('moodService', ['$log', 'moodcatBackend', function($log, moodcatBackend) {

    /**
     * Retrieves list of moods from API.
     */
    this.getMoods = function() {
      $log.info('Fetching moods from API');
      return moodcatBackend.get('/api/moods/');
    };
}]);
