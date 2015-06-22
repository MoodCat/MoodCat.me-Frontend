'use strict';

 angular.module('moodCatAudio')
   .service('soundCloudService', ['$cookieStore', '$rootScope',
     'SoundCloudLogin', 'SoundCloudAPI', 'SoundCloudSessionManager',
     function($cookieStore, $rootScope, SoundCloudLogin, SoundCloudAPI, SoundCloudSessionManager) {

     /**
      * Fetch the metadata for a song
      * @param trackID
      * @returns {*} Promise
      */
     this.fetchMetadata = SoundCloudAPI.fetchMetadata;

     /**
      * Login to SoundCloud using a popup dialog.
      *
      * @returns {*} a promise
      */
     this.loginUsingSoundcloud = function() {
       return SoundCloudLogin.connect().then(function SoundCloudLoginCallback() {
         $cookieStore.put('scAuth', SoundCloudSessionManager.accessToken);
         $rootScope.loggedIn = true;
         $rootScope.$broadcast('soundcloud-login');
       });
     };

     /**
      * Logout from SoundCloud.
      */
     this.logout = function() {
       SoundCloudSessionManager.disconnect();
       $rootScope.$broadcast('soundcloud-logout');
       $rootScope.loggedIn = false;
       $cookieStore.remove('scAuth');
     };

     SoundCloudSessionManager.init($cookieStore.get('scAuth'));

     /**
      * Get information about the logged in user.
      * @returns {*} metadata about the user
      */
     this.getMe = SoundCloudAPI.me;

     $rootScope.loggedIn = SoundCloudSessionManager.isConnected();
     if($rootScope.loggedIn) {
       $rootScope.$broadcast('soundcloud-login');
     }

     this.checkConnection = SoundCloudSessionManager.isConnected.bind(SoundCloudSessionManager);
     this.getToken = SoundCloudSessionManager.getToken;

}]);
