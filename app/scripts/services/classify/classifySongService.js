'use strict';

angular.module('moodCatApp')
    .service('classifySongService', [
        'moodcatBackend',
        function(moodcatBackend) {

            /**
             * Retrieves a random sample of unclassified songs to classify.
             */
            this.getSongs = function getSongs() {
                return moodcatBackend.get('/api/songs/toclassify');
            };
        }
    ]);
