'use strict';

 angular.module('moodCatAudio')
   .controller('AudioCtrl', ['$scope', '$rootScope', '$compile', 'moodcatBackend', '$log', 'soundCloudService', 'currentSongService',
        function($scope, $rootScope, $compile, moodcatBackend, $log, soundCloudService, currentSongService) {
    /**
     *  A boolean that checks if the user has already voted on this song.
     * @type {Boolean}
     */
     this.voted = false;

     $scope.$on('next-song', (function() {
       this.voted = false;
     }).bind(this));

   this.voteUp = function voteUp() {
     this.vote('LIKE');
   };

   this.voteDown = function voteDown() {
     this.vote('DISLIKE');

     var elem = angular.element('<feedback-sam/>');
     angular.element('#feedback-sam-container').append(elem);
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
              token : soundCloudService.getToken()
            }
          });
          $log.info('%s send to song %d', orientation, $scope.song.id);
        }
    };
 }]);
