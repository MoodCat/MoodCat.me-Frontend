'use strict';

angular.module('moodCatApp')
  .controller('selectRoomController', ['$scope', 'roomService', 'rooms', '$state', function($scope, roomService, rooms, $state) {

    $scope.rooms = rooms;

    $scope.switchRoom = function switchRoom(room) {
      roomService.switchRoom(room);
      $state.go('room', {
        roomId : room.id
      });
    };

}]);
