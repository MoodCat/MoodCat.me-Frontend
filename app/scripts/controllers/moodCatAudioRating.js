'use strict';

angular.module('moodCatApp')
  .directive("myDirective", function(){
    return {
      restrict: "EA",
      scope: {
        // Two way bind these values
        soundcloudID: "=",
        arousal: "=",
        valence: "=",
        updateAVVector: "&" // Method binding

      },
      template: "<div>The current soundcloudID is : {{soundcloudID}} with arousal {{arousal}} and valence {{valence}}</div>"+
      "Change the arousal : <input type='text' ng-model='arousal' />"+
      "Change the valence : <input type='text' ng-model='valence' />"
    };
  });
