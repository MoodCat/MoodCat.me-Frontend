'use strict';

 angular.module('moodCatAudio')
   .service('soundCloudService', ['$q', '$cookieStore', '$rootScope', 'soundCloudKey', 'moodcatBackend', '$log', 'ngAudioGlobals', function($q, $cookieStore, $rootScope, soundCloudKey, moodcatBackend, $log, ngAudioGlobals) {

     ngAudioGlobals.unlock = false;

     /**
      * Fetch the metadata for a song
      * @param trackID
      * @returns {*} Promise
      */
     this.fetchMetadata = function fetchMetadata(trackID) {
       $log.info('Fetch meta data for trackID %d', trackID);
       return moodcatBackend.get('https://api.soundcloud.com/tracks/'+trackID+
         '?client_id='+soundCloudKey);
     };

      SC.initialize({
        client_id: soundCloudKey,
        redirect_uri: window.location.origin /* Only works from localhost:8080 currently*/,
        access_token: $cookieStore.get('scAuth'),
        scope: 'non-expiring'
      });

      this.loginUsingSoundcloud = function loginUsingSoundcloud() {
        var deferred = $q.defer();

        SC.connect(function() {
          deferred.resolve();
          var accessToken = SC.accessToken();
          $cookieStore.put('scAuth', accessToken);
          $rootScope.loggedIn = true;
          $rootScope.$broadcast('soundcloud-login');
        });

        return deferred.promise;
      };

      this.getMe = function getMe() {
          var deferred = $q.defer();
          SC.get('/me', function(me, error) {
            if(error) {
              deferred.reject(error);
            }
            else {
              deferred.resolve(me);
            }
          });
          return deferred.promise;
      };

      $rootScope.loggedIn = SC.isConnected();
      if($rootScope.loggedIn) {
        $rootScope.$broadcast('soundcloud-login');
      }
      this.checkConnection = SC.isConnected.bind(SC);
      this.getToken = $cookieStore.get.bind($cookieStore, 'scAuth');

}]);
