'use strict';

angular.module('moodCatApp')
    .service('classifySongService', [
        'moodcatBackend',
        function(moodcatBackend) {
            this.getSongs = function getSongs() {
                return moodcatBackend.get('/api/songs/toclassify');
            };
        }
    ]);
