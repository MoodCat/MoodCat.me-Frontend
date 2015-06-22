'use strict';

angular.module('moodCatUtil')
  .service('moodcatBackend', ['$http', '$log', function($http, $log) {

  /**
   * Perform a HTTP call to the moodcat backend
   * @param path Path on the moodcat server
   * @param options options
   * @returns {*} Promise for the result
   */
  this.get = function(path, options) {
    options = options || {};
    options.params = options.params || {};
    options.params._t = (new Date()).valueOf();

    return $http.get(path, options)
      .then(
      function(res) { return res.data; },
      $log.warn.bind($log, 'Failed to fetch response')
    );
  };

  /**
   * Perform a HTTP call to the moodcat backend
   * @param path Path on the moodcat server
   * @param data data to send
   * @param options options
   * @returns {*} Promise for the result
   */
  this.post = function(path, data, options) {
    return $http.post.apply($http, arguments)
      .error($log.warn.bind($log, 'Failed to fetch response'))
      .then(
      function(res) { return res.data },
      $log.warn.bind($log, 'Failed to fetch response')
    );
  };

}]);
