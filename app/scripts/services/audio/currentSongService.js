'use strict';

 angular.module('moodCatAudio')
   .constant('HowlDefaults', {
     format: 'mp3',
     autoplay: false,
     buffer: true
   })
   .service('HowlService', ['HowlDefaults', '$q', '$timeout', function(HowlDefaults, $q, $timeout) {

     var howler, muted = false, that = this;

     /**
      * Load a song. Initialize howler.js.
      * @param song Song to load
      * @returns {*} current HowlService
      */
     this.loadSong = function loadSong(url) {
       if(howler) {
         howler.unload();
       }

       howler = window.howler=  new Howl(angular.extend({
         urls: [url]
       }, HowlDefaults));

       howler.off = function off(event, fn) {
         var events = howler['_on' + event];
         var index = events.indexOf(fn);
         if(index !== -1) {
           events.splice(index, 1);
         }
       };

       howler.one = function one(event, fn) {
         howler.on(event, function bliep() {
           fn();
           howler.off(event, bliep);
         });
       };

       angular.element(document.body)
         .one('touchstart', function() {
           howler.unload();
           howler.urls([url]);
           that.play();
         });
       return this;
     };

     /**
      * Unbind this song.
      */
     this.unbind = function unbind() {
       return howler.unload();
     };

     /**
      * Start playing.
      * @returns {*} A promise that resolves when playing the song.
      */
     this.play = function play() {
       var dfd = $q.defer();
       howler.one('play', dfd.resolve.bind(dfd, that));
       howler.one('loaderror', dfd.reject.bind(dfd, that));
       howler.play();
       return dfd.promise;
     };

     /**
      * Pause the music.
      */
     this.pause = function pause() {
       howler.pause();
     };

     /**
      * Stop the music.
      */
     this.stop = function stop() {
       var dfd = $q.defer();
       howler.stop();
       setTimeout(dfd.resolve, 5);
       return dfd.promise;
     };

     /**
      * Set the current time.
      * @param value
      * @returns {*|Howl|Float}
      */
     this.setCurrentTime = function setCurrentTime(value) {
       return howler.pos(value / 1000);
     };

     /**
      * Duration for the song.
      * @type {number}
      */
     Object.defineProperty(this, 'duration', {
       get: function() {
         return howler._duration;
       }
     });

     /**
      * Boolean that checks if we are muting audio
      */
     Object.defineProperty(this, 'muting', {
       get: function() {
         return muted;
       },
       set: function(value) {
         if(muted = value) {
           howler.mute();
         }
         else {
           howler.unmute();
         }
       }
     });

     /**
      * Get the current time of howler.
      */
     Object.defineProperty(this, 'currentTime', {
       get: function() {
         return howler.pos() * 1000;
       },
       set: function(value) {
         //$timeout(howler.pos.bind(howler, value), 5);
         howler.pos(value / 1000);
         return value;
       }
     });

     /**
      * Track the progress. Returns a percentage.
      */
     Object.defineProperty(this, 'progress', {
       get: function() {
         return typeof howler._duration === "number" && howler._duration !== 0.0 ?
           Math.round(howler.pos() / howler._duration * 100) : 0;
       }
     });

   }])
   .service('currentSongService', [
     'soundCloudService',
     '$rootScope',
     'soundCloudKey',
     '$log',
     'HowlService',
     function(soundCloudService, $rootScope, soundCloudKey, $log, HowlService) {

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

     /**
      * Initialize the visibility of the feedbackSAMs to hidden until we need it.
      */
     $rootScope.feedbackSAM = false;

     /**
      * Stops and unloads the song playing.
      */
     this.stop = function stop() {
         $rootScope.sound.stop();
         $rootScope.sound = null;
     };

     var currentPromise = null;

     /**
      * Load a song
      * @param trackID - The SoundCloud trackID to load.
      * @param time - the timestamp to set the song to initially.
      * @returns {*} Promise
      */
     this.loadSong = function loadSong(soundCloudId, time) {
       if(currentPromise !== null){
         return currentPromise;
       }

       time = time || 0;
       $log.info('Loading track id %s', soundCloudId);

       $rootScope.sound = HowlService.loadSong('https://api.soundcloud.com/tracks/'+ soundCloudId +
         '/stream?client_id=' + soundCloudKey);

       currentPromise =  $rootScope.sound.play()
         .then(function playing(sound) {
           sound.currentTime = time;
           sound.muting = sound.muting;
           $rootScope.$broadcast('next-song');
           $log.warn("Started playing song %d", soundCloudId);
           currentPromise = null;
         },
         function loadFailed() {
           $log.warn("Failed to load song %d", soundCloudId);
           currentPromise = null;
         });

       return currentPromise;
     };

     /**
      * Create a timestamp in HH:MM:SS format from a value
      * @param value magic numbers go in here
      * @returns {*} sane strings go out
      */
     function createTimestamp(value) {
       var seconds, minutes, hours;
       if(!isFinite(value)) {
         return '00:00:00';
       }
       seconds = Math.floor(value);
       minutes = seconds == 0 ? 0 : Math.floor(seconds / 60);
       hours = minutes == 0 ? 0 : Math.floor(minutes / 60);
       minutes -= hours * 60;
       seconds -= minutes * 60;

       return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
     }

     /**
      * Defines $rootScope.currentTimecode, a global getter for the progression of the song.
      * @return {String} A readable timestamp indication how far the current song has progressed.
      */
     Object.defineProperty($rootScope, 'currentTimecode', {
       get: function getTimestamp() {
         var val = 0.0;
         if (angular.isObject($rootScope.sound)) {
           val = $rootScope.sound.currentTime / 1000;
         }

         return createTimestamp(val);
       }
     });

     /**
      * Defines $rootScope.durationTimecode, a global getter for the duration of the song.
      * @return {String} A readable timestamp indicating how long the song is.
      */
     Object.defineProperty($rootScope, 'durationTimecode', {
       get: function getTimestamp() {
         var val = 0.0;
         if (angular.isObject($rootScope.sound)) {
           val = $rootScope.sound.duration;
         }

         return createTimestamp(val);
       }
     });

 }]);
