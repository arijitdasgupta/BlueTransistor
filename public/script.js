(function(){
  angular.module('application', [])
  .factory('BulbsService', function($http, $log){
    'ngInject';

    var getBulbs = function(){
      return $http.get('/bulbs').then(function(response){
        return response.data;
      });
    };

    var setBulbs = function(bulbsData){
      return $http.post('/bulbs', {bulbs:bulbsData}).then(function(response){
        return response.data;
      });
    };

    return {
      getBulbs: getBulbs,
      setBulbs: setBulbs
    };
  })
  .controller('MainController', function($scope, $log, BulbsService){
    'ngInject';
    $log.info('initiating application');

    $scope.colors = [];

    var COLOR_MAX = 100;
    var COLOR_RES = 20;

    var timerIntervals;

    var init = function(){
      BulbsService.getBulbs().then(function(bulbs){
        $scope.bulbs = bulbs;
        $log.info('Number of bulbs online', $scope.bulbs.length);
      })
      .then(initiateColors)
      .then(initiateTimers);
    };

    var initiateColors = function(){
      for(var i = 0; i < COLOR_MAX; i += COLOR_RES){
        for(var j = 0; j < COLOR_MAX; j += COLOR_RES){
          for(var k = COLOR_RES; k < COLOR_MAX; k += COLOR_RES){
            var newColor = hslToRgb(i/COLOR_MAX, j/COLOR_MAX, k/COLOR_MAX);
            $scope.colors.push(newColor);
          }
        }
      }

      $scope.colors.push([255,0,0]);
      $scope.colors.push([0,255,0]);
      $scope.colors.push([0,0,255]);
      $scope.colors.push([255,255,0]);
      $scope.colors.push([255,0,255]);
      $scope.colors.push([0,255,255]);
      $scope.colors.push([255,255,255]);

      return $scope.colors;
    }

    var initiateTimers = function(){
      timerIntervals = _.map($scope.bulbs, function(item){return null;});
    }

    var getColor = function(color){
      return {
        red: color[0],
        green: color[1],
        blue: color[2],
        alpha: 200
      };
    }

    $scope.setColor = function(bulbindex, color){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return (index === bulbindex)?getColor(color):'unchanged';
      }));
    };

    $scope.turnOff = function(bulbindex){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return (index === bulbindex)?'off':'unchanged';
      }));
    };

    $scope.setChanger = function(bulbindex){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return (index === bulbindex)?_.map($scope.colors,getColor):'unchanged';
      }));
    };

    $scope.toggleChanger = function(bulbindex){
      if(!timerIntervals[bulbindex]){
        timerIntervals[bulbindex] = setInterval(function(){
          var index = Math.floor(Math.random() * $scope.colors.length);
          var newColor = $scope.colors[index];
          BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
            return (index === bulbindex)?getColor(newColor):'unchanged';
          }));
        }, 1000);
      }
      else{
        clearInterval(timerIntervals[bulbindex]);
        timerIntervals[bulbindex] = null;
      }
    };

    init();

    // Initiate colors

    // Initiate API
  });
})();
