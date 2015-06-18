'use strict';

angular.module('moodCatAudio')
  .value('soundCloudKey', window.location.hostname === 'localhost' ?
    'cef809be114bdf9f856c735139f2aeba' : 'b45b1aa10f1ac2941910a7f0d10f8e28')
  .value('track', '202330997');
