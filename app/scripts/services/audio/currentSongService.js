'use strict';

 angular.module('moodCatAudio')
   .service('currentSongService', [
     'soundCloudService',
     'ngAudio',
     '$rootScope',
     'soundCloudKey',
     '$log',
     function(soundCloudService, ngAudio, $rootScope, soundCloudKey, $log) {

     /**
      * Pad a string with zeroes
      * @param str string to pad
      * @param max wanted string length
      * @returns {String} padded string
      */
     function pad (str, max) {
       str = str.toString();
       return str.length < max ? pad('0' + str, max) : str;
     }

     $rootScope.feedbackSAM = false;

     this.stop = function stop() {
         $rootScope.sound.stop();
         $rootScope.sound.unbind();
         $rootScope.sound = null;
     };

     /**
      * Load a song
      * @param trackID
      * @returns {*} Promise
      */
     this.loadSong = function loadSong(trackID, time) {
       time = time || 0;
       $log.info('Loading track id %s', trackID);
       if(angular.isObject($rootScope.sound)) {
           this.stop();
       }
           var sound = window.cursound = $rootScope.sound =
             ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);
           $rootScope.$broadcast('next-song');
           if(time && isFinite(time)) {
             sound.setCurrentTime(time);
           }
           sound.play();
     };

     /**
      * Get the timestamp
      * @returns {string} Timestamp string (hh:mm:ss)
      */
     this.getTimestamp = function getTimestamp() {
       var val = 0.0, seconds, minutes, millis, hours;
       if (angular.isObject($rootScope.sound)) {
         val = $rootScope.sound.currentTime;
       }
       seconds = Math.floor(val);
       minutes = seconds == 0 ? 0 : Math.floor(seconds / 60);
       hours = minutes == 0 ? 0 : Math.floor(minutes / 60);
       minutes -= hours * 60;
       //millis = Math.round((val - seconds) * 1000);
       seconds -= minutes * 60;

       return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);// + '.' + pad(millis, 3);
     };

 }]);
