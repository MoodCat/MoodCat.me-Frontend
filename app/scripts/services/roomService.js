'use strict';

angular.module('moodCatApp')
  .service('roomService', [
    'moodcatBackend',
    '$rootScope',
    'currentSongService',
    '$log',
    '$interval',
    function(moodcatBackend, $rootScope, currentSongService, $log, $interval) {

      /**
       * Retrieves list of suitable rooms based on given moods
       * @param {List<String>} moods List of moods to get roosm for.
       */
      this.fetchRooms = function fetchRoom(moods) {
        return moodcatBackend.get('/api/rooms/', {
          params: {
            mood : moods
          }
        });
      };

      /**
       * Fetch a Room object from the API, based on its roomID
       * @param {int} roomId The roomID for which to fetch the room.
       */
      this.fetchRoom = function fetchRoom(roomId) {
        return moodcatBackend.get('/api/rooms/' + roomId);
      };

      /**
       * Fetch the current status of the music playing from the API.
       * This is used to sync the user with the server.
       * @param {int} roomId RoomID to retrieve status for.
       */
      this.fetchNowPlaying = function fetchNowPlaying(roomId) {
        return moodcatBackend.get('/api/rooms/' + roomId + '/now-playing');
      };

      /**
       * Switch current room to the given room.
       * This resets state and loads the song of the new room.
       * @param {Object} room Room to join.
       */
      this.switchRoom = function switchRoom(room) {
        if(!room) {return;}
        if(!$rootScope.room || $rootScope.room.id !== room.id) {
          $rootScope.room = room;
		      $rootScope.song = room.nowPlaying.song;
          currentSongService.loadSong(room.nowPlaying.song.soundCloudId, room.nowPlaying.time / 1000);
          $log.info("Joining room %s", room.name);
          $rootScope.feedbackSAM = false;
        }
        return room;
    };

      /**
       * Syncs song to the data provided by the server.
       */
      this.startInterval = function startInterval() {
        if(this.interval) return;
        this.interval = $interval((function() {
          if(!$rootScope.room) {
            return;
          }
          this.fetchNowPlaying($rootScope.room.id).then(function(nowPlaying) {
            if(!$rootScope.song || $rootScope.song.id !== nowPlaying.song.id) {
              $rootScope.song = nowPlaying.song;
              currentSongService.loadSong(nowPlaying.song.soundCloudId, nowPlaying.time / 1000);
              $rootScope.song = nowPlaying.song;
            }
            else {
              var currentTime = Math.round($rootScope.sound.currentTime * 1000);
              var timeDiff = nowPlaying.time - currentTime;

              if(Math.abs(timeDiff) > 2000) {
                $rootScope.sound.setCurrentTime(nowPlaying.time / 1000);
                if(timeDiff < 0) {
                  $rootScope.$broadcast('next-song');
                }
              }
            }
          });
        }).bind(this), 1000);
      };

      /**
       * Stops the syncing of the current song.
       */
      this.clearInterval = function() {
        $interval.cancel(this.interval);
        this.interval = null;
      };

      // Start the interval on controller creation.
      this.startInterval();

      // Fix state issues when switching to classify game.
      $rootScope.$on('$stateChangeStart', (function(event, toState, toParams, fromState, fromParams){
        if(toState.name === 'classify') {
          this.clearInterval();
        }
        else {
          this.startInterval();
        }
      }).bind(this));
    }
]);
