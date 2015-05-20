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
   .controller('AudioCtrl', ['$scope', 'ngAudio', 'soundCloudKey', 'track', '$http', '$log', 'soundCloudService', function($scope, ngAudio, soundCloudKey, track, $http, $log, soundCloudService) {

    /**
     *  A boolean that checks if the user has already voted on this song.
     * @type {Boolean}
     */
      $scope.voted = false;

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

       return soundCloudService.fetchMetadata(trackID).success(function(data) {

         $scope.song = data;
         $log.info("Playing song %s", data.title);
         $scope.sound = ngAudio.load('https://api.soundcloud.com/tracks/'+trackID+'/stream?client_id='+soundCloudKey);
         $scope.voted = false;
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

     /**
      * Function to handel votes.
      * @param  oriantation, if a song is liked or disliked.
      * @return nothing
      */
      this.vote = function vote(oriantation){
        if($scope.voted){
          alert("You have already voted on this song.")
        }
        else if(angular.isObject($scope.sound)){
          $scope.voted = true;
          $http.post('/api/songs/'+$scope.song.id+'/vote/'+oriantation);
          $log.info(oriantation + " send to song " + $scope.song.id);
        }
        else{
          alert("You aren't playing a song, right now.")
        }
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
   });
