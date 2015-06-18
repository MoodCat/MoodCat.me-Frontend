'use strict';

angular.module('moodCatApp')
  .directive('fallbackSrc', function () {
    return{
      link: function postLink(scope, element, attrs) {
        element.bind('error', function () {
          angular.element(this).attr('src', attrs.fallbackSrc);
        });
      }
    };
  })
  .directive('myDirective', function(){
    return {
      restrict: 'EA',
      scope: {
        // Two way bind these values
        soundcloudID: '=',
        arousal: '=',
        valence: '=',
        updateAVVector: '&' // Method binding
      },
      template: '<div>The current soundcloudID is : {{soundcloudID}} with arousal {{arousal}} and valence {{valence}}</div>'+
        'Change the arousal : <input type="text" ng-model="arousal" />'+
        'Change the valence : <input type="text" ng-model="valence" />'
    };
  });

angular.module('moodCatAudio')
  .directive('soundCloudLogin', function() {
    return {
      restrict: 'EA',
      controller: 'SoundCloudController',
      controllerAs: 'scCtrl',
      template: '<a ng-click="scCtrl.loginUsingSoundcloud()" ng-if="!loggedIn">Login</a>'+
        '<div ng-if="loggedIn" class="navbar-user-details">'+
        '<img ng-src="{{scCtrl.me.avatar_url}}"/>'+
        '<span  ng-bind="scCtrl.me.first_name"></span>'+
        '</div>'
    };
  })
  .directive('btnMood', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        ngModel : '='
      },
      template: '<label noselect class="flexbtn"><input type="checkbox" ng-model="ngModel"/><span ng-transclude class="mood-label"></span></label>'
    };
  })
  .directive('feedbackSam', ['ClassificationService', function(ClassificationService) {
    return {
      restrict : 'AE',
      templateUrl : 'views/feedbackSAM.html',
      scope: true,
      controllerAs : 'feedbackCtrl',
      controller: ['$element', '$scope', function feedbackSamController($element, $scope) {

        function mapToObjectWithValue(i) {
          return { value: i };
        }

        this.arousalOptions = [-1.0, -0.5, 0.0, 0.5, 1.0].map(mapToObjectWithValue);
        this.valenceOptions = [-1.0, -0.5, 0.0, 0.5, 1.0].map(mapToObjectWithValue);

        this.classification = {
          valence: this.valenceOptions[2].value,
          arousal: this.arousalOptions[2].value
        };

        this.sendClassification = function sendClassification() {
          // You can only classify if there is currently a song playing
          if(!angular.isObject($scope.sound)) {
            return;
          }

          ClassificationService.sendClassification($scope.song, this.classification);
          this.hideFeedback();
        };

        this.hideFeedback = function hideFeedback() {
          $scope.$emit('classification-end');
          $scope.$destroy();
          $element.remove();
        };
      }]
    };
  }]);
