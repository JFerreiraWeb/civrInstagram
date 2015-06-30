(function (){
//função anónima

  var app = angular.module('app', ['ionic','angularMoment'])

  .factory('PersonService', function($http){
  var BASE_URL = "https://api.instagram.com/v1/tags/circuitovilareal/media/recent?access_token=1368360108.119d058.c88a3bdad63f4c6e923eb96b9db732df";
  var items = [];
  
  return {
    GetFeed: function(){
      return $http.get(BASE_URL+'&count=10').then(function(response){
        items = response.data;
        return items;
      });
    },
    GetNewPhotos: function(){
      return $http.get(BASE_URL+'&count=2').then(function(response){
        items = response.data;
        return items;
      });
    },
    GetOldPhotos: function(){
      return $http.get(BASE_URL+'&count=10').then(function(response){
        items = response.data;
        return items;
      });
    }
  }
});



 

  //definir controlador dos alojamentos
  app.controller('LodgingController', function($http, $scope) {

    $scope.page=1;
    $scope.lodgings=[];
    $scope.pagesLoaded=0;
    $scope.noMoreItemsAvailable = false;
     

    $scope.loadMoreLodgings = function (){

    if ($scope.lodgings.length>0){
      $scope.page = $scope.page + 1;
      $scope.pagesLoaded = $scope.pagesLoaded+1;

    }
    $http.get('http://www.civr.pt/category/app-alojamento/?json=get_recent_posts&page='+$scope.page)
    .success(function(response){
      angular.forEach(response.posts, function(post) {
        $scope.lodgings.push(post);

      });

      if($scope.pagesLoaded >= response.pages){

        $scope.noMoreItemsAvailable=true;
      }
      
      $scope.$broadcast('scroll.infiniteScrollComplete');
      
});
  };
});


  //definir controlador dos restaurantes
  app.controller('RestaurantController', function($http, $scope) {

  

  $scope.restaurants = [];
  $scope.page=1;
  $scope.pagesLoaded=0;
  $scope.noMoreItemsAvailable = false;

  $scope.loadMoreRestaurants = function (){

    if ($scope.restaurants.length>0){
      $scope.page = $scope.page + 1;
      $scope.pagesLoaded = $scope.pagesLoaded+1;

    }
    $http.get('http://www.civr.pt/category/app-restaurantes/?json=get_recent_posts&page='+$scope.page)
    .success(function(response){


      angular.forEach(response.posts, function(post) {
        $scope.restaurants.push(post);

      });

      if($scope.pagesLoaded >= response.pages){

        $scope.noMoreItemsAvailable=true;
      }
      
      $scope.$broadcast('scroll.infiniteScrollComplete');
      
});




    };
  });






//definir controlador do feed do instagram
app.controller('CivrInstagramController', function($scope, $timeout, PersonService) {
  $scope.items = [];
  $scope.newItems = [];
  
  PersonService.GetFeed().then(function(items){
  $scope.items = items;
  });
  
  $scope.doRefresh = function() {
    if($scope.newItems.length > 0){
      $scope.items = $scope.newItems.concat($scope.items);
        
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
      
      $scope.newItems = [];
    } else {
      PersonService.GetNewPhotos().then(function(items){
        $scope.items = items.concat($scope.items);
        
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
  };
  
  $scope.loadMore = function(){
    PersonService.GetOldPhotos().then(function(items) {
      $scope.items = $scope.items.concat(items);
    
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };
  
   var CheckNewItems = function(){
    $timeout(function(){
      PersonService.GetNewPhotos().then(function(items){
        $scope.newItems = items.concat($scope.newItems);
      
        CheckNewItems();
      });
    },10000);
   }
  
  CheckNewItems();
});


   




//passar o nosso config que utiliza stateprovider e urlrouterprovider utilizados para nav
  app.config(function($stateProvider, $urlRouterProvider){
//definir state para o home view
    $stateProvider.state('home', {

      url: '/home',
      views: {
        'tab-home': {
          templateUrl:'templates/home.html'
        }

      }
      
    });


    //definir state para o home.instacivrfeed view
    $stateProvider.state('instacivrfeed', {

      url: '/instacivrfeed',
      views: {
        //queremos mm esta nav
        'tab-home': {
          templateUrl:'templates/instacivrfeed.html',
          controller:'CivrInstagramController'
        }

      }
      
    });




//definir state para o info view
    $stateProvider.state('info', {

      url: '/info',
      views: {
        //queremos mm esta nav
        'tab-info': {
          templateUrl:'templates/info.html'
        }

      }
      
    });
      //definir state para o info.alojamento view
      $stateProvider.state('lodging', {

      url: '/lodgings',
      views: {
        //queremos mm esta nav
        'tab-info': {
          templateUrl:'templates/lodgings.html',
          controller:'LodgingController'
        }

      }
      
    });


      //definir state para o info.restaurant view
      $stateProvider.state('restaurants', {

      url: '/restaurants',
      views: {
        //queremos mm esta nav
        'tab-info': {
          templateUrl:'templates/restaurants.html',
          controller:'RestaurantController'
        }

      }
      
    });

   

//definir state para o results view
    $stateProvider.state('results', {

      url: '/results',
      views: {
        'tab-results': {
          templateUrl:'templates/results.html'
        }

      }
    });
//se nao houver correspondencia de state muda o state para /home view
    $urlRouterProvider.otherwise('/home');
  });




app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.cordova && window.cordova.InAppBrowser){

      window.open = window.cordova.InAppBrowser.open;
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
}());
