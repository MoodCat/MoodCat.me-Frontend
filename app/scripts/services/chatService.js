'use strict';

angular.module('moodCatApp')
  .service('chatService', ['moodcatBackend', '$log', 'soundCloudService', function(moodcatBackend, $log, soundCloudService) {

    this.sendChatMessage = function(mess, roomId) {
      return moodcatBackend.post('/api/rooms/' + roomId + '/messages', angular.toJson(mess), {
        params: {
          token : soundCloudService.getToken()
        }
      });
  };

    this.fetchMessages = function(roomId) {
      $log.info('Fetched messages for chat %s', roomId);
      return moodcatBackend.get('/api/rooms/' + roomId + '/messages');
  };

    this.fetchMessagesFromMessage = function(roomId,latestId) {
      $log.info('Fetched messages for chat %s', roomId);
      return moodcatBackend.get('/api/rooms/' + roomId + '/messages/' + latestId);
  };

}]);
