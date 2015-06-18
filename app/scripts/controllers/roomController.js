'use strict';

angular.module('moodCatApp')
  .controller('roomController', function($rootScope, $scope, $timeout, $interval, chatService, messages) {

      $scope.messages = messages;

      $scope.chatMessage = {
        message: ''
      };

      this.addMessage = function addMessage() {
        // TODO login check
        if ($scope.chatMessage.message === '') {
            return;
        }

        //Send the mesage to the server
        chatService.sendChatMessage($scope.chatMessage, $scope.room.id)
          .then(this.fetchMessages.bind(this));

        //Clear the chat input field
        $scope.chatMessage.message = '';

      };

      $scope.addMessage = this.addMessage.bind(this);

      this.scrollDown = function scrollDown() {
        $timeout(function() {
          var list = angular.element('#chat-messages-list')[0];
          list.scrollTop = list.scrollHeight;
        });
      }

      /**
       * Fetch the new messages send.
       */
      this.fetchMessages = function fetchMessages(){
        var lastMessageId = -1;

        if($scope.messages && $scope.messages.length) {
          lastMessageId = Math.max.apply(null, $scope.messages.map(function(message) {
            return message.id;
          }));
        }

        chatService.fetchMessagesFromMessage($scope.room.id, lastMessageId).then((function(response){
            $scope.messages = $scope.messages.concat(response);
            this.scrollDown();
          }).bind(this));

      };

      this.scrollDown();
      var intervalMessages = $interval(this.fetchMessages.bind(this), 1000);
      $scope.$on('$destroy', $interval.cancel.bind($interval, intervalMessages));

  });
