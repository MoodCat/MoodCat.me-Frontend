'use strict';

describe('Controller: AudioCtrl', function () {

  // load the controller's module
  beforeEach(module('moodCatAudio'));

  var AudioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AudioCtrl = $controller('AudioCtrl', {
      $scope: scope
    });
  }));

  it('After loading a song, the song object should be defined', function () {
    scope.loadSong('202330997');
    //console.log(scope);
    expect(scope.sound).toBeDefined();
  });
});
