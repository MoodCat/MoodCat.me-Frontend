'use strict';

angular.module('moodCatApp')
  .controller('roomController', function($rootScope, $scope, $timeout, $interval, chatService, messages) {

    var that = this;

      /**
       * The messages in the current chatroom.
       */
      $scope.messages = messages;

      /**
       * A template for a message object, making it easier to send a message over to the API.
       * @type {Object}
       */
      $scope.chatMessage = {
        message: ''
      };

      /**
       * Sends a chat message to the backend, and resets the input field.
       * Message has to be non-empty
       */
      this.addMessage = function addMessage() {
        // TODO login check
        if ($scope.chatMessage.message === '') {
            return;
        }

        //Send the mesage to the server
        chatService.sendChatMessage($scope.chatMessage, $scope.room.id)
          .then(this.fetchMessagesInSync);

        //Clear the chat input field
        $scope.chatMessage.message = '';

      };

      // Make the addMessage() function available for the entire $scope.
      $scope.addMessage = this.addMessage.bind(this);

      /**
       * If a new message is received, scroll the chatbox down so it will become visible.
       */
      this.scrollDown = function scrollDown(force) {
        force = force || false;

        $timeout(function() {
          var list = angular.element('#chat-messages-list')[0];

          /*
            The clientHeight is the total length of the currently visible part of the element.
            The scrollTop is the value of how far the element has been scrolled.
            The scrollHeight is the value of how far the element can scroll.
            Therefore the scrollTop can be maximally clientHeight + scrollTop,
            as an element without a scrollbar can't scroll, which requires the clientHeight.

            18 = The height of 1 chat message. It only scrolls down if you are reading
            the last 10 messages.
           */
          if (force || (list.scrollHeight - (list.clientHeight + list.scrollTop) < 10 * 18)) {
            list.scrollTop = list.scrollHeight;
          }
        });
      };

      /**
       * Fetch any new messages by other users..
       */
      this.fetchMessages = function fetchMessages(){
        var lastMessageId = -1;

        if($scope.messages && $scope.messages.length) {
          lastMessageId = Math.max.apply(null, $scope.messages.map(function(message) {
            return message.id;
          }));
        }

        return chatService.fetchMessagesFromMessage($scope.room.id, lastMessageId).then(function(response){
            $scope.messages = $scope.messages.concat(response);
            that.scrollDown();
          });
      };

      var lastPromise;

    /**
     * Fetch messages synchronously. This means we will wait for the latest response before
     * a new request to synchronize is started.
     * @returns {*} a Promise
     */
      this.fetchMessagesInSync = function fetchMessagesInSync() {
        if(lastPromise) {
          lastPromise = lastPromise.then(that.fetchMessages);
        }
        else {
          lastPromise = that.fetchMessages();
        }
        return lastPromise;
      };

      this.scrollDown(true);

      // Query the API for new messages every second
      var intervalMessages = $interval(this.fetchMessagesInSync, 1000);

      // If the controller is destroyed, cancel the message checking interval.
      $scope.$on('$destroy', $interval.cancel.bind($interval, intervalMessages));

  });
