var discGolfApp = angular.module(
    'discGolfApp', 
    [
        'ngRoute',
        'ngAnimate',
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

discGolfApp.directive(
    'expandCollapseIcon',
    function(){
        return {
            link: function(scope, el, attr) {

                angular.element(el[0].querySelector('.fa')).addClass('fa-chevron-right');

                el.on('hide.bs.collapse', function(ev){
                    angular.element(el[0].querySelector('.fa'))
                        .removeClass('fa-chevron-down')
                        .addClass('fa-chevron-right');
                });

                el.on('show.bs.collapse', function(ev){
                    angular.element(el[0].querySelector('.fa'))
                        .removeClass('fa-chevron-right')
                        .addClass('fa-chevron-down'); 
                });
            }
        };
    });

discGolfApp.directive(
    'pageBody',
    ['$window',
    function($window) {
        return {
            link: function(scope, el, attr) {

//                var window = angular.element($window);
//                window.bind('resize', function () {
//                    scope.$apply();
//                });
                
                function resizeBody (windowHeight) {
                    var navbarHeight = $('.navbar-header').outerHeight();
                    var headerHeight = $('.page-header').outerHeight() + navbarHeight;
                    var footerHeight = $('.page-footer').outerHeight();
                    
                    el.css('margin-top', headerHeight + 'px');
                    el.css('margin-bottom', footerHeight + 'px');
                }

                scope.$watch(function() {
                    return $('.page-header').innerHeight();
                }, function(value) {
                    resizeBody(value);
                });


            }
        };
    }]);

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
             templateUrl: 'partials/home.html',
             controller: 'SettingsController'
         }).
         when('/new-game', {
             templateUrl: 'partials/newGame.html',
             controller: 'NewGameController'
         }).
         when('/games', {
             templateUrl: 'partials/games.html',
             controller: 'GameController'
         }).
         when('/games/:gameId', {
             templateUrl: 'partials/game.html',
             controller: 'GameController'
         }).
         when('/games/:gameId/:basket', {
             templateUrl: 'partials/basket.html',
             controller: 'BasketController'
         }).
         when('/players', {
             templateUrl: 'partials/players.html',
             controller: 'PlayerController'
         }).
         when('/courses', {
             templateUrl: 'partials/courses.html',
             controller: 'CourseController'
         }).
         when('/courses/:courseId', {
             templateUrl: 'partials/course.html',
             controller: 'CourseController'
         }).
         when('/settings', {
             templateUrl: 'partials/settings.html',
             controller: 'SettingsController'
         }).
         when('/about', {
             templateUrl: 'partials/about.html'
         }).
         otherwise({
             redirectTo: '/home'
         });
     }]);



