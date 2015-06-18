'use strict';

angular.module('moodCatApp')
  .controller('LeaderBoardCtrl', ['board',
    function(board) {
        this.board = board;
    }
  ]);
