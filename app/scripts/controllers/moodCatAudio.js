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
   .service('soundCloudService', ['soundCloudKey', '$http', '$log', function(soundCloudKey, $http, $log) {

     /**
      * Fetch the metadata for a song
      * @param trackID
      * @returns {*} Promise
      */
     this.fetchMetadata = function fetchMetadata(trackID) {
       $log.info("Fetch meta data for trackID %d", trackID);
       return $http.get('https://api.soundcloud.com/tracks/'+trackID+'?client_id='+soundCloudKey);
     }

   }])
   .controller('AudioCtrl', ['$scope', 'ngAudio', 'soundCloudKey', 'track', '$http', '$log', 'soundCloudService',
        function($scope, ngAudio, soundCloudKey, track, $http, $log, soundCloudService) {

     /**
      * Pad a string with zeroes
      * @param str string to pad
      * @param max wanted string length
      * @returns {String} padded string
      */
     function pad (str, max) {
       str = str.toString();
       return str.length < max ? pad("0" + str, max) : str;
     }

     /**
      * Load a song
      * @param trackID
      * @returns {*} Promise
      */
     $scope.loadSong = function loadSong(trackID) {
       $log.info("Loading track id %s", trackID);
       if(angular.isObject($scope.sound)) {
         $scope.sound.stop();
         $scope.sound.unbind();
         $scope.sound = null;
       }

       $log.log("we dont have metadata");
       return soundCloudService.fetchMetadata(trackID).success(function(data) {
         $log.log("we have metadata");
         $scope.song = data;
         $log.info("Playing song %s", data.title);
         $scope.sound = ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);
         //$scope.sound.play();
       });
     }

     Object.defineProperty($scope, 'timestamp', {
       get: function() {
         var val = 0.0, seconds, minutes, millis, hours;
         if(angular.isObject($scope.sound)) {
           val = $scope.sound.currentTime;
         }
         seconds = Math.floor(val);
         minutes = Math.floor(seconds / 60);
         hours = Math.floor(minutes / 60);
         minutes -= hours * 60;
         //millis = Math.round((val - seconds) * 1000);
         seconds -= minutes * 60;

         return pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);// + "." + pad(millis, 3);
       }
     });

     $scope.arousalOptions = [
         {
             'value' : -1
         },
         {
             'value' : -0.5
         },
         {
             'value' : 0
         },
         {
             'value' : 0.5
         },
         {
             'value' : 1
         }
     ];
     $scope.valenceOptions = [
         {
             'value' : -1
         },
         {
             'value' : -0.5
         },
         {
             'value' : 0
         },
         {
             'value' : 0.5
         },
         {
             'value' : 1
         }
     ];

     $scope.arousal = $scope.arousalOptions[2];
     $scope.valence = $scope.valenceOptions[2];

     $scope.sendClassification = function sendClassification() {
         // You can only classify if there is currently a song playing
         if(!angular.isObject($scope.sound)) {
             return;
         }

         var data = {
             'arousal' : $scope.arousal,
             'valence' : $scope.valence
         };

         // TODO: convert to own ID instead of SoundCloud track ID.
         var request = $http.post('/api/songs/' + $scope.song.id + "/classify", angular.toJson(data));
         request.success(
           function(response) {
               $log.info("Thank you for your feedback!");
           }
         );
     }

     //$scope.loadSong(track);
   }])
   .controller("SoundCloudController", ['soundCloudKey', '$scope', function(soundCloudKey, $scope) {
     SC.initialize({
       client_id: soundCloudKey,
       redirect_uri: window.location.origin // Only works from localhost:8080 currently
     });

     this.loggedIn = false;

     this.loginUsingSoundcloud = function loginUsingSoundcloud() {
       SC.connect((function() {
         SC.get('/me', (function(me) {
           this.loggedIn = true;
           this.me = me;
         }).bind(this));
       }).bind(this));
     }
   }])
   .directive('btnMood', function() {
     return {
       restrict: 'E',
       transclude: true,
       scope: {
         ngModel : '='
       },
       template: '<label noselect><input type="checkbox" ng-model="ngModel"/><span ng-transclude class="mood-label"></span></label>'
     }
   })
   .directive('feedbackSam', function() {
       return {
           restrict : 'E',
           scope : false,
           templateUrl : 'views/feedbackSAM.html'
       }
   });
