'use strict';

angular.module('SoundCloud')
  .value('soundCloudKey', window.location.hostname === 'localhost' ?
    'cef809be114bdf9f856c735139f2aeba' : '162a776dd9119b0ef24fc234d8709a18');

angular.module('moodCatAudio')
  .value('track', '202330997');

