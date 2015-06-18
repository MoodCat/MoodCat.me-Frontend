'use strict';

 angular.module('moodCatAudio')
   .controller('SoundCloudController', ['soundCloudService', '$timeout', '$scope', function(soundCloudService, $timeout, $scope) {

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
