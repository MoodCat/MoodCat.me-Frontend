'use strict';

describe('Controller: AudioCtrl', function () {

  // load the controller's module
  beforeEach(module('moodCatAudio'));

  var AudioCtrl,
    scope,
    songId,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $injector, $httpBackend) {
    scope = $rootScope.$new();

    AudioCtrl = $controller('AudioCtrl', {
      $scope: scope
    });

    httpBackend = $httpBackend;
    songId = '202330997';

    // var deferred = $q.defer();
    // deferred.resolve('somevalue'); //  always resolved, you can do it from your spec

    var mockPayload = { title: 'mockTitle' };
    var promise = { then: mockPayload };

    // jasmine 2.0
    httpBackend.when('get', 'https://api.soundcloud.com/tracks/'+songId+'?client_id=cef809be114bdf9f856c735139f2aeba').respond(promise);

  }));

  // it('loads a song, then the sound variable should be defined', function () {
  //   scope.loadSong(songId);
  //   console.log(scope);
  //   expect(scope.sound).toBeDefined();
  // });
  //
  // it('loads a song, then the sound variable should be an object', function () {
  //   scope.loadSong(songId);
  //   expect(typeof scope.sound).toBe('object');
  // });
  //
  // it('should not error when we unload a song without loading it', function () {
  //   scope.unloadSong();
  //   expect(true).toBe(true);
  // });

});
