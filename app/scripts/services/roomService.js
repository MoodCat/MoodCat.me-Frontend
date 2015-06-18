'use strict';

angular.module('moodCatApp')
  .service('roomService', [
    'moodcatBackend',
    '$rootScope',
    'currentSongService',
    '$log',
    '$interval',
    function(moodcatBackend, $rootScope, currentSongService, $log, $interval) {

      this.fetchRooms = function fetchRoom(moods) {
        return moodcatBackend.get('/api/rooms/', {
          params: {
            mood : moods
          }
        });
      };

      this.fetchRoom = function fetchRoom(roomId) {
        return moodcatBackend.get('/api/rooms/' + roomId);
    };

      this.fetchNowPlaying = function fetchNowPlaying(roomId) {
        return moodcatBackend.get('/api/rooms/' + roomId + '/now-playing');
      };

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

      this.startInterval = function startInterval() {
        if(this.interval != null) return;
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

              if(Math.abs(timeDiff) > 1000) {
                $rootScope.sound.setCurrentTime(nowPlaying.time / 1000);
                if(timeDiff < 0) {
                  $rootScope.$broadcast('next-song');
                }
              }
            }
          });
        }).bind(this), 1000);
      };

      this.clearInterval = function() {
        $interval.cancel(this.interval);
        this.interval = null;
      };

      this.startInterval();

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
