'use strict';

 angular.module('moodCatAudio')
   .constant('HowlDefaults', {
     format: 'mp3',
     autoplay: false,
     buffer: true
   })
   .service('HowlService', ['HowlDefaults', '$q', '$timeout', function(HowlDefaults, $q, $timeout) {
      this.loadSong = function loadSong(url) {

        var dfd, muted, howler, wrapper;

        dfd = $q.defer();
        muted = false;

        window.howler = howler = new Howl(angular.extend({
          urls: [url]
        }, HowlDefaults));

        wrapper = {
          unbind: howler.unload.bind(howler),
          play: howler.play.bind(howler),
          pause: howler.pause.bind(howler),
          stop: howler.stop.bind(howler),
          setCurrentTime: howler.pos.bind(howler)
        };

        Object.defineProperty(wrapper, 'muting', {
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

        Object.defineProperty(wrapper, 'currentTime', {
          get: function() {
            return howler.pos();
          },
          set: function(value) {
            $timeout(howler.pos.bind(howler, value), 5);
            return value;
          }
        });

        Object.defineProperty(wrapper, 'progress', {
          get: function() {
            return typeof howler._duration === "number" && howler._duration !== 0.0 ?
              Math.round(howler.pos() / howler._duration * 100) : 0;
          }
        });

        Object.defineProperty(wrapper, 'duration', {
          get: function() {
            return howler._duration;
          }
        });

        howler.on('load', dfd.resolve.bind(dfd, wrapper));
        howler.on('loaderror', dfd.reject.bind(dfd, wrapper));
        howler.load();
        return dfd.promise;
      }

   }])
   .service('currentSongService', [
     'soundCloudService',
     'ngAudio',
     '$rootScope',
     'soundCloudKey',
     '$log',
     'HowlService',
     function(soundCloudService, ngAudio, $rootScope, soundCloudKey, $log, HowlService) {

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
         $rootScope.sound.unbind();
         $rootScope.sound = null;
     };

     /**
      * Load a song
      * @param trackID - The SoundCloud trackID to load.
      * @param time - the timestamp to set the song to initially.
      * @returns {*} Promise
      */
     this.loadSong = function loadSong(trackID, time) {
       time = time || 0;
       $log.info('Loading track id %s', trackID);

       var muting = false;

       if(angular.isObject($rootScope.sound)) {
         this.stop();
       }
       //var sound = window.cursound = $rootScope.sound =
         //ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);

       HowlService.loadSong('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey)
         .then(function soundLoaded(sound) {
           $rootScope.sound = window.cursound = sound;
           $rootScope.$broadcast('next-song');
           sound.muting = muting;
           sound.play();
           sound.currentTime = time;
         }, $log.warn.bind($log, "Failed to load song %s", trackID));
       ;
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
           val = $rootScope.sound.currentTime;
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
