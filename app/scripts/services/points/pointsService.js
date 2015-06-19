'use strict';

 angular.module('moodCatAudio')
   /**
    * Gets the points from the backend.
    * @return {Number} Points of a user.
    */
   .service('PointsService', ['moodcatBackend','soundCloudService',
      function (moodcatBackend,soundCloudService) {

        /**
         * Retrieves the points of the current user.
         * This function is authenticated with a soundcloud usertoken.
         */
        this.getPoints = function getPoints() {
          return moodcatBackend.get('/api/users/me/points', {
              params: {
                  token: soundCloudService.getToken()
              }
          });
        };
      }
    ])
