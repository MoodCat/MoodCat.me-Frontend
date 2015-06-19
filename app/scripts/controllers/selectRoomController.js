'use strict';

angular.module('moodCatApp')
  .controller('selectRoomController', ['$scope', 'roomService', 'rooms', '$state', function($scope, roomService, rooms, $state) {

    /**
     * A list of rooms the user can choose from.
     */
    $scope.rooms = rooms;

    /**
     * Switch the state to the given room.
     * @param {Object} room to switch to.
     */
    $scope.switchRoom = function switchRoom(room) {
      roomService.switchRoom(room);
      $state.go('room', {
        roomId : room.id
      });
    };

}]);
