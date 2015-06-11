'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:AudioCtrl
 * @description
 * # AudioCtrl
 * Controller of the audio of moodcat
 */
 angular.module('moodCatAudio')
   .value('soundCloudKey', 'cef809be114bdf9f856c735139f2aeba')
   .value('track', '202330997')
   .service('soundCloudService', ['soundCloudKey', '$http', '$log', 'ngAudioGlobals', function(soundCloudKey, $http, $log, ngAudioGlobals) {

     ngAudioGlobals.unlock = false;

     /**
      * Fetch the metadata for a song
      * @param trackID
      * @returns {*} Promise
      */
     this.fetchMetadata = function fetchMetadata(trackID) {
       $log.info('Fetch meta data for trackID %d', trackID);
       return $http.get('https://api.soundcloud.com/tracks/'+trackID+
                  '?client_id='+soundCloudKey).then(function(response) {
         return response.data;
       });
     }

   }])
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
     }

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

       return soundCloudService.fetchMetadata(trackID)
         .then((function(song) {
           $rootScope.song = song;
           $log.info('Playing song %s', song.title);
           var sound = window.cursound = $rootScope.sound =
             ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);
           sound.setCurrentTime(time);
           sound.play();
         }).bind(this));
     }

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
     }

   }])
   .controller('AudioCtrl', ['$scope', '$rootScope', 'ngAudio', 'soundCloudKey', 'track', '$http', '$log', 'soundCloudService', 'currentSongService',
        function($scope, $rootScope, ngAudio, soundCloudKey, track, $http, $log, soundCloudService, currentSongService) {

    /**
     *  A boolean that checks if the user has already voted on this song.
     * @type {Boolean}
     */
     $scope.voted = false;

     Object.defineProperty($scope, 'timestamp', {
       get: currentSongService.getTimestamp.bind(currentSongService)
     });

     $scope.arousalOptions = [-1.0, -0.5, 0.0, 0.5, 1.0].map(function(i) {
       return {
         value: i
       };
     });

     $scope.valenceOptions = [-1.0, -0.5, 0.0, 0.5, 1.0].map(function(i) {
       return {
        value: i
       };
     });

     $scope.classification = {
       valence: $scope.valenceOptions[2].value,
       arousal: $scope.arousalOptions[2].value
     };

     $scope.sendClassification = function sendClassification() {
      // You can only classify if there is currently a song playing
      if(!angular.isObject($scope.sound)) {
       return;
      }
      // TODO: convert to own ID instead of SoundCloud track ID.
      var request = $http.post('/api/songs/' + $scope.song.id + '/classify', $scope.classification);
      request.success(
        function(response) {
         $log.info('Thank you for your feedback!');
       }
      );
      $scope.hideFeedback();
    };

    $scope.hideFeedback = function() {
      $rootScope.feedbackSAM = false;
    };

     /**
      * Function to handle votes.
      * @param  oriantation, if a song is liked or disliked.
      * @return nothing
      */
      this.vote = function vote(oriantation){
        if(angular.isObject($scope.sound) && !$scope.voted){
          $scope.voted = true;
          $http.post('/api/songs/'+$scope.song.id+'/vote/'+oriantation);
          $log.info(oriantation + ' send to song ' + $scope.song.id);
        }
     }
   }])
   .service('SoundCloudService', ['$q', 'soundCloudKey', function($q, soundCloudKey) {
     SC.initialize({
       client_id: soundCloudKey,
       redirect_uri: window.location.origin // Only works from localhost:8080 currently
     });

     this.loginUsingSoundcloud = function loginUsingSoundcloud() {
       var deferred = $q.defer();
       SC.connect(function() {
         SC.get('/me', function(me, error) {
           if(error) {
             deferred.reject(error);
           }
           else {
             deferred.resolve(me);
           }
         });
       });
       return deferred.promise;
     }
   }])
   
   /**
    * Gets the points from the backend.
    * @return {Number} Points of a user.
    */
   .service('PointsService', ['$http',
      function ($http) {
        this.getPoints = function getPoints() {
          return $http.get('/api/users/me').then(function(user) {
            return $http.get('/api/users/' + user.data.id +'/points');
          });
        }
      }        
    ])

   .controller('SoundCloudController', ['SoundCloudService', '$rootScope', function(SoundCloudService, $rootScope) {
     $rootScope.loggedIn = false;
     
     this.loginUsingSoundcloud = function() {
       SoundCloudService.loginUsingSoundcloud().then((function(me) {
         this.me = me;
         $rootScope.loggedIn = true;
       }).bind(this))
     }

   }])
   .directive('btnMood', function() {
     return {
       restrict: 'E',
       transclude: true,
       scope: {
         ngModel : '='
       },
       template: '<label noselect class="flexbtn"><input type="checkbox" ng-model="ngModel"/><span ng-transclude class="mood-label"></span></label>'
     }
   })
   .directive('feedbackSam', function() {
       return {
           restrict : 'E',
           scope : false,
           templateUrl : 'views/feedbackSAM.html'
       }
   });
