'use strict';

angular.module('moodCatApp')
  .service('chatService', ['moodcatBackend', '$log', 'soundCloudService', function(moodcatBackend, $log, soundCloudService) {

    /**
     * Sends a message for a given room to the backend.
     * @param {Object} mess   The message object to send.
     * @param {int} roomId The room id for the room to send the message to.
     */
    this.sendChatMessage = function(mess, roomId) {
      return moodcatBackend.post('/api/rooms/' + roomId + '/messages', angular.toJson(mess), {
        params: {
          token : soundCloudService.getToken()
        }
      });
    };

    /**
     * Fetches messages from API for a given roomID
     * @param {int} roomId The roomID to fetch messages for.
     */
    this.fetchMessages = function(roomId) {
      return moodcatBackend.get('/api/rooms/' + roomId + '/messages');
    };

    /**
     * Fetches messages from API for a given roomID, passing the last received ID.
     * @param {int} roomId   The room to fetch messages for.
     * @param {int} latestId The latest message ID we did receive.
     */
    this.fetchMessagesFromMessage = function(roomId,latestId) {
      return moodcatBackend.get('/api/rooms/' + roomId + '/messages/' + latestId);
  };

}]);
