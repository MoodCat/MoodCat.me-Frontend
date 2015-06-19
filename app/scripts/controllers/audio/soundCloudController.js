'use strict';

 angular.module('moodCatAudio')
   .controller('SoundCloudController', ['soundCloudService', '$timeout', '$scope', function(soundCloudService, $timeout, $scope) {

     /**
      * Call the SoundCloud API to retrieve data about the current user.
      */
     this.updateMe = function() {
       soundCloudService.getMe().then((function(me) {
         this.me = me;
       }).bind(this));
     };

     if($scope.loggedIn) {
       this.updateMe();
     }

     $scope.$on('soundcloud-login', this.updateMe.bind(this));
     this.loginUsingSoundcloud = soundCloudService.loginUsingSoundcloud.bind(soundCloudService);
 }]);
