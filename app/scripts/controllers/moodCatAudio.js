'use strict';

/**
 * @ngdoc function
 * @name moodCatApp.controller:AudioCtrl
 * @description
 * # AudioCtrl
 * Controller of the audio of moodcat
 */
 angular.module('moodCatAudio')
   .value('soundCloudKey', 'b45b1aa10f1ac2941910a7f0d10f8e28')
   .value('track', '202330997')
   .service('soundCloudService', ['soundCloudKey', 'moodcatBackend', '$log', 'ngAudioGlobals', function(soundCloudKey, moodcatBackend, $log, ngAudioGlobals) {

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
           var sound = window.cursound = $rootScope.sound =
             ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);
           $rootScope.$broadcast('next-song');
           sound.setCurrentTime(time);
           sound.play();
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
   .controller('AudioCtrl', ['$scope', '$rootScope', '$compile', 'moodcatBackend', '$log', 'SoundCloudService', 'currentSongService',
        function($scope, $rootScope, $compile, moodcatBackend, $log, SoundCloudService, currentSongService) {
    /**
     *  A boolean that checks if the user has already voted on this song.
     * @type {Boolean}
     */
     this.voted = false;

     $scope.$on('next-song', (function() {
       this.voted = false;
     }).bind(this));

     Object.defineProperty($scope, 'timestamp', {
       get: currentSongService.getTimestamp.bind(currentSongService)
     });

   this.voteUp = function voteUp() {
     this.vote("LIKE");
   };

   this.voteDown = function voteDown() {
     this.vote("DISLIKE");

     var elem = angular.element('<feedback-sam/>');
     elem.insertAfter(angular.element('#feedback-sam-container'));
     $compile(elem)($scope);
   };
     /**
      * Function to handle votes.
      * @param  orientation, if a song is liked or disliked.
      * @return nothing
      */
      this.vote = function vote(orientation){
        if(angular.isObject($scope.sound) && !this.voted){
          this.voted = true;
          moodcatBackend.post('/api/rooms/'+$scope.room.id+'/vote/'+orientation, null, {
            params: {
              token : SoundCloudService.getToken()
            }
          });
          $log.info('%s send to song %d', orientation, $scope.song.id);
        }
     }
   }])
   .service('SoundCloudService', ['$q', 'soundCloudKey', '$cookieStore', '$rootScope', function($q, soundCloudKey, $cookieStore, $rootScope) {
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

   }])

   /**
    * Gets the points from the backend.
    * @return {Number} Points of a user.
    */
   .service('PointsService', ['moodcatBackend','SoundCloudService',
      function (moodcatBackend,SoundCloudService) {
        this.getPoints = function getPoints() {
          return moodcatBackend.get('/api/users/me', {
            params: {
              token : SoundCloudService.getToken()
            }
          }).then(function(user) {
            return moodcatBackend.get('/api/users/' + user.id +'/points');
          });
        }
      }
    ])

   .controller('SoundCloudController', ['SoundCloudService', '$timeout', '$scope', function(SoundCloudService, $timeout, $scope) {

     this.updateMe = function() {
       SoundCloudService.getMe().then((function(me) {
         this.me = me;
       }).bind(this));
     };

     if($scope.loggedIn) {
       this.updateMe();
     }

     $scope.$on('soundcloud-login', this.updateMe.bind(this));
     this.loginUsingSoundcloud = SoundCloudService.loginUsingSoundcloud.bind(SoundCloudService);
   }])
   .directive('soundCloudLogin', function() {
     return {
       restrict: 'EA',
       controller: 'SoundCloudController',
       controllerAs: 'scCtrl',
       template: ' <a ng-click="scCtrl.loginUsingSoundcloud()" ng-if="!loggedIn">Login</a>\
          <div ng-if="loggedIn" class="navbar-user-details">\
            <img ng-src="{{scCtrl.me.avatar_url}}"/>\
          <span  ng-bind="scCtrl.me.first_name"></span>\
         </div>'
     };
   })
   .directive('btnMood', function() {
     return {
       restrict: 'E',
       transclude: true,
       scope: {
         ngModel : '='
       },
       template: '<label noselect class="flexbtn"><input type="checkbox" ng-model="ngModel"/><span ng-transclude class="mood-label"></span></label>'
     };
   })
   .service('ClassificationService', ['moodcatBackend', '$log', function ClassificationService(moodcatBackend, $log) {

     /**
      * Send a classification to the backend.
      *
      * @param song Song to be classified.
      * @param classification Classification to send.
      * @returns {*} A promise
      */
     this.sendClassification = function sendClassification(song, classification) {
       // TODO: convert to own ID instead of SoundCloud track ID.
       return moodcatBackend.post('/api/songs/' + song.soundCloudId + '/classify', classification).then(function() {
         $log.info('Thank you for your feedback!');
       });
     };

   }])
   .directive('feedbackSam', ['ClassificationService', function(ClassificationService) {
     return {
       restrict : 'AE',
       templateUrl : 'views/feedbackSAM.html',
       scope: true,
       controllerAs : 'feedbackCtrl',
       controller: ['$element', '$scope', function feedbackSamController($element, $scope) {

         function mapToObjectWithValue(i) {
           return { value: i };
         };

         this.arousalOptions = [-1.0, -0.5, 0.0, 0.5, 1.0].map(mapToObjectWithValue);
         this.valenceOptions = [-1.0, -0.5, 0.0, 0.5, 1.0].map(mapToObjectWithValue);

         this.classification = {
           valence: this.valenceOptions[2].value,
           arousal: this.arousalOptions[2].value
         };

         this.sendClassification = function sendClassification() {
           // You can only classify if there is currently a song playing
           if(!angular.isObject($scope.sound)) {
             return;
           }

           ClassificationService.sendClassification($scope.song, this.classification);
           this.hideFeedback();
         };

         this.hideFeedback = function hideFeedback() {
           $scope.$emit('classification-end');
           $scope.$destroy();
           $element.remove();
         };
       }]
     };
   }]);
