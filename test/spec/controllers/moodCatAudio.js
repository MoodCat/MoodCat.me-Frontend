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
    httpBackend.when('get', 'https://api.soundcloud.com/tracks/'+songId+'?client_id=68d16250d1ef387ae1000e9102a23ddb').respond(promise);

  }));

  it('loads a song, then the sound variable should be defined', function () {
    scope.loadSong(songId);
    expect(scope.sound).toBeDefined();
  });

  it('loads a song, then the sound variable should be an object', function () {
    scope.loadSong(songId);
    expect(typeof scope.sound).toBe('object');
  });

  it('should not error when we unload a song without loading it', function () {
    scope.unloadSong();
    expect(true).toBe(true);
  });

  it('should load the title onto a custom field on the song object', function () {
    var done = false;
    scope.loadSong(songId).then(function() {
      done = true;
      expect(scope.song.title.toString()).toBe('UMEK ft. Jameisha Trice - Live The Life (Original Mix)');
    });
    waitsFor(function() {
      return done;
    }, 'The promise should succeed', 1000);
    //httpBackend.flush();
  });
});
