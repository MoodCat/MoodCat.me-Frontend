'use strict';

angular.module('moodCatAudio')
  .value('soundCloudKey', window.location.hostname === 'localhost' ?
    'cef809be114bdf9f856c735139f2aeba' : '162a776dd9119b0ef24fc234d8709a18')
  .value('track', '202330997');
