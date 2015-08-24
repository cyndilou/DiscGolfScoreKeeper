var discGolfApp = angular.module(
    'discGolfApp', 
    [
        'ngRoute',
        'discGolfControllers',
        'discGolfFactories'
    ]);

discGolfApp.directive(
    'showFocus', 
    function($timeout) {
        return function(scope, element, attrs) {
            scope.$watch(attrs.showFocus, 
                         function (newValue) { 
                $timeout(function() {
                    newValue && element.focus();
                });
            },true);
        };    
    });

//discGolfApp.directive(
//    'flexibleWidth', 
//    function($document) {
//        return {
//            link: function($scope, element, attrs) {
//                $scope.$watch(
//                    function () {
//                        return element.children().length;
//                    },
//                    function () {
//                        var totalWidth=0;
//                        var totalHeight = 0;
//                        var children = element.children();
//                        for (var i = 0; i < children.length; i ++) {
//                            totalWidth += children[i].clientWidth;
//                            totalHeight = Math.max(totalHeight, children[i].clientHeight);
//                        }
//                        //                        element.children().width(function (index, width) {
//                        //                            totalWidth += width;
//                        //                        }); 
//                        //                        
//                        //                        element.children().height(function (index, height) {
//                        //                            totalHeight = Math.max(totalHeight, height);
//                        //                        }); 
//
//                        totalWidth += 50;
//                        totalHeight += 10;
//
//                        element.css("width", totalWidth + "px");
//                        element.css("height", totalHeight + "px");
//                    }
//                );
//            }
//        };
//    });

discGolfApp.directive(
    'resizeParent', 
    function($document) {
        return {
            link: function($scope, element, attrs) {
                $scope.$watch(
                    element.width(),
                    function () {
                        var parent = element.parent();

                        var totalWidth=0;
                        var totalHeight = 0;
                        var children = parent.children();
                        for (var i = 0; i < children.length; i ++) {
                            totalWidth += children[i].clientWidth;
                            totalHeight = Math.max(totalHeight, children[i].clientHeight);
                        }

                        totalWidth += 25;
                        totalHeight += 10;

                        parent.css("width", totalWidth + "px");
                        parent.css("height", totalHeight + "px");
                    }
                );
            }
        };
    });

discGolfApp.config(
    ['$routeProvider',
     function($routeProvider) {
         $routeProvider.
         when('/home', {
             templateUrl: 'partials/home.html'
         }).
         //                        when('/scorecard', {
         //                            templateUrl: 'partials/scorecard.html'
         //                        }).
         when('/new-game', {
             templateUrl: 'partials/newGame.html',
             controller: 'NewGameController'
         }).
         //                        when('/games', {
         //                            templateUrl: 'partials/gameHistory.html'//,
         //                            //controller: 'GameListController'
         //                        }).
         //                        when('/games/:gameId', {
         //                            templateUrl: 'partials/game.html'//,
         //                            //controller: 'GameController'
         //                        }).
         when('/games/:gameId/:basket', {
             templateUrl: 'partials/basket.html',
             controller: 'GameController'
         }).
         when('/players', {
             templateUrl: 'partials/players.html',
             controller: 'PlayerController'
         }).
         //                        when('/courses', {
         //                            templateUrl: 'partials/courses.html'
         //                        }).
         when('/settings', {
             templateUrl: 'partials/settings.html',
             controller: 'SettingsController'
         }).
         //                        when('/about', {
         //                            templateUrl: 'partials/about.html'
         //                        }).
         //      when('/phones/:phoneId', {
         //        templateUrl: 'partials/phone-detail.html',
         //        controller: 'PhoneDetailCtrl'
         //      }).
         otherwise({
             //redirectTo: '/home'
             templateUrl: 'partials/undefined.html'
         });
     }]);



