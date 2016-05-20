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

    $scope.setAll = false;

    var timerIntervals;

    var init = function(){
      BulbsService.getBulbs().then(function(bulbs){
        $scope.bulbs = bulbs;
        $log.info('Number of bulbs online', $scope.bulbs.length);
      })
      .then(initiateColors)
      .then(initiateTimers);
    };

    // Very crude color palette generator
    var initiateColors = function(){
      var COLOR_MAX = 255;
      var COLOR_RES = 64;
      var COLOR_MIN = 32;

      for(var i = COLOR_MIN; i < COLOR_MAX; i += COLOR_RES){
        for(var j = COLOR_MIN; j < COLOR_MAX; j += COLOR_RES){
          for(var k = COLOR_MIN; k < COLOR_MAX; k += COLOR_RES){
            var newColor = [i, j, k];
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
        alpha: 255
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

    $scope.setRandom = function(bulbindex){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return (index === bulbindex)?'random':'unchanged';
      }));
    };

    $scope.setFlow = function(bulbindex){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return (index === bulbindex)?'flow':'unchanged';
      }));
    };

    $scope.setDisco = function(bulbindex){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return (index === bulbindex)?'disco':'unchanged';
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


    // To change all the bulbs
    $scope.setColorAll = function(color){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return getColor(color);
      }));
    };

    $scope.turnOffAll = function(){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return 'off';
      }));
    };

    $scope.setChangerAll = function(){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return _.map($scope.colors,getColor);
      }));
    };

    $scope.setFlowAll = function(){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return 'flow';
      }));
    };

    $scope.setDiscoAll = function(){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return 'disco';
      }));
    };

    $scope.setRandomAll = function(){
      BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
        return 'random';
      }));
    };

    $scope.toggleChangerAll = function(){
      var isOneInterval = _.filter(timerIntervals,function(interval){return !!interval;}).length !== 0;
      if(isOneInterval){
        _.forEach($scope.bulbs, function(bulb, index){
          clearInterval(timerIntervals[index]);
          timerIntervals[index] = null;
        });
      }
      else {
        _.forEach($scope.bulbs, function(bulb, index){
          timerIntervals[index] = setInterval(function(){
            var index = Math.floor(Math.random() * $scope.colors.length);
            var newColor = $scope.colors[index];
            BulbsService.setBulbs(_.map($scope.bulbs, function(item, index){
              return (index === index)?getColor(newColor):'unchanged';
            }));
          }, 1000);
        });
      }
    };

    init();
  });
})();
