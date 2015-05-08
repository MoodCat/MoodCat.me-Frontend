'use strict';

describe('Controller: AudioCtrl', function () {

  // load the controller's module
  beforeEach(module('moodCatAudio'));

  var $rootScope,
    scope,
    $httpBackend,
    createController,
    timeout,
    ngAudioMock,
    songId;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, $timeout) {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    songId = '202330997';
    timeout = $timeout;

    ngAudioMock = {
      load: angular.noop
    }

    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');
    scope = $rootScope.$new();

    createController = function() {
      return $controller('AudioCtrl', {
        '$scope' : scope,
        'ngAudio' : ngAudioMock
      });
    };

  }));

   it('loads a song, then the sound variable should be defined', function (done) {
     var controller = createController();
     $httpBackend
       .expectGET('https://api.soundcloud.com/tracks/202330997?client_id=cef809be114bdf9f856c735139f2aeba')
       .respond({ title: 'mockTitle'});

     spyOn(ngAudioMock, 'load');

     scope.loadSong(202330997).success(function() {
       expect(scope.song).toBeDefined();
       expect(ngAudioMock.load).toHaveBeenCalled();
       setTimeout(done, 1);
     });

     $httpBackend.flush();
   });

  it('loads a song, then the sound variable should be an object', function (done) {
    var controller = createController();
    $httpBackend
      .expectGET('https://api.soundcloud.com/tracks/202330997?client_id=cef809be114bdf9f856c735139f2aeba')
      .respond({ title: 'mockTitle'});

    var actual = {};
    spyOn(ngAudioMock, 'load').and.returnValue(actual);

    scope.loadSong(202330997).success(function() {
      expect(ngAudioMock.load).toHaveBeenCalled();
      expect(scope.sound).toEqual(actual);
      setTimeout(done, 1);
    });

    $httpBackend.flush();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
