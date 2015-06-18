'use strict';

 angular.module('moodCatAudio')
   .service('ClassificationService', ['moodcatBackend', '$log', 'soundCloudService', function ClassificationService(moodcatBackend, $log, soundCloudService) {

     /**
      * Send a classification to the backend.
      *
      * @param song Song to be classified.
      * @param classification Classification to send.
      * @returns {*} A promise
      */
     this.sendClassification = function sendClassification(song, classification) {
       // TODO: convert to own ID instead of SoundCloud track ID.
       return moodcatBackend.post('/api/songs/' + song.soundCloudId + '/classify', classification, {
         params: {
           token : soundCloudService.getToken()
         }
       }).then(function() {
         $log.info('Thank you for your feedback!');
       });
     };

   }]);
