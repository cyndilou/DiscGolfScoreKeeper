var discGolfControllers = angular.module('discGolfControllers', []);

discGolfControllers.controller(
    'PlayerController', 
    ['$scope', '$http', 'PlayerFactory',
     function ($scope, $http, PlayerFactory) {

         $scope.loadPlayers = function () {
             PlayerFactory.getList().then( function (response) {
                 $scope.playerList = response.players;
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.loadPlayers();

         $scope.tempPlayers = {};

         $scope.editPlayer = function (player) {
             $scope.tempPlayers[player._id] = {
                 name: player.name
             };
         };

         $scope.endEdit = function (player, saveChanges) {
             if (saveChanges == true) {
                 player.name = $scope.tempPlayers[player._id].name;
                 PlayerFactory.update(player);
             }

             delete $scope.tempPlayers[player._id];
         };

         $scope.addPlayer = function () {
             PlayerFactory.create('').then(function(res) {
                 $scope.tempPlayers[res.id] = {
                     name: ''
                 };

                 PlayerFactory.get(res.id).then(function (response) {
                     $scope.playerList.push(response.player);
                 });
             });
         }

         $scope.deletePlayer = function (player) {
             PlayerFactory.delete(player._id).then( function (response) {
                 var index = $scope.playerList.indexOf(player);
                 if (index == -1) {
                     $scope.loadPlayers();
                 }
                 else {
                     $scope.playerList.splice(index, 1);
                 }

                 delete $scope.tempPlayers[player._id];
             });
         }
     }]);

discGolfControllers.controller(
    'NewGameController', 
    ['$scope', '$http', '$location', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, $http, $location, PlayerFactory, CourseFactory, GameFactory) {

         $scope.newPlayerName = '';
         $scope.newCourseName = '';
         $scope.newCourseHoleCount = 9;

         CourseFactory.getList().then( function (response) {
             $scope.courseList = response.courses;
         }).catch( function (err) {
             console.error(err);
         });

         PlayerFactory.getList().then( function (response) {
             $scope.playerList = response.players;
         }).catch( function (err) {
             console.error(err);
         });

         $scope.selectedCourseId;
         $scope.selectedPlayers = [];

         $scope.addNewPlayer = function () {
             PlayerFactory.create($scope.newPlayerName).then(function(response) {
                 $scope.selectedPlayers.push(response.id);
                 $scope.newPlayerName = '';

                 PlayerFactory.get(response.id).then(function (response) {
                     $scope.playerList.push(response.player);
                 });
             });
         }

         $scope.addCourse = function () {
             CourseFactory.create($scope.newCourseName, $scope.newCourseHoleCount).then(function(response) {
                 $scope.newCourseName = '';

                 CourseFactory.get(response.course.id).then(function (response) {
                     $scope.courseList.push(response.course);
                     $scope.selectedCourseId = response.course._id;
                 });
             });
         }

         $scope.toggleSelection = function toggleSelection(player) {
             var idx = $scope.selectedPlayers.indexOf(player._id);
             if (idx > -1) {
                 $scope.selectedPlayers.splice(idx, 1);
             } else {
                 $scope.selectedPlayers.push(player._id);
             }
         };

         $scope.onStartGame = function () {
             GameFactory.create($scope.selectedCourseId, $scope.selectedPlayers).then(function(response) {
                 $location.path('games/' + response.game.id + '/1');
             });
         };
     }]);

discGolfControllers.controller(
    'BasketController', 
    ['$scope', '$routeParams','$http', '$location', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, $routeParams, $http, $location, PlayerFactory, CourseFactory, GameFactory) {

         $scope.gameId = $routeParams.gameId;
         $scope.holeNumber = Number($routeParams.basket);

         $scope.game = GameFactory.get($scope.gameId);
         $scope.course = CourseFactory.get($scope.game.courseId);

         $scope.gamePlayers = [];
         angular.forEach($scope.game.playerIds, function (value, index) {
             var player = PlayerFactory.get(value);
             var lastHoleScore = $scope.game.holeScores[($scope.holeNumber - 1)] !== undefined ? $scope.game.holeScores[($scope.holeNumber - 1)][player.id] : 0;
             var totalScore = $scope.game.getPlayerTotalScore(player.id);

             this.push ({id: player.id, name: player.name, lastHoleScore: lastHoleScore, totalScore: totalScore});
         }, $scope.gamePlayers);

         var highScore = ($scope.course.holes[$scope.holeNumber] !== undefined ? $scope.course.holes[$scope.holeNumber].par * 5 : 15);

         $scope.scoreOptions = [];
         for (var i = 1; i <= highScore; i++) {
             $scope.scoreOptions.push(i);
         }

         $scope.updateCourse = function () {
             CourseFactory.update($scope.course);
         }

         $scope.setPlayerScore = function (player, score) {
             $scope.game.setPlayerScore($scope.holeNumber, player.id, score);
             GameFactory.update($scope.game);
         }

         $scope.gameOver = function () {
             $location.path('games/' + $scope.game.id);
         }

         $scope.isHoleComplete = function () {
             if ($scope.game.holeScores[$scope.holeNumber] === undefined) {
                 return false;
             }

             for (index in $scope.game.playerIds) {
                 if ($scope.game.holeScores[$scope.holeNumber][$scope.game.playerIds[index]] === undefined) {
                     return false;
                 }
             }

             return true;
         }

         $scope.nextHole = function () {
             $location.path('games/' + $scope.game.id + '/' + ($scope.holeNumber+1));
         }

         $scope.previousHole = function () {
             $location.path('games/' + $scope.game.id + '/' + ($scope.holeNumber-1));
         }
     }]);

discGolfControllers.controller(
    'SettingsController', 
    ['$scope', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, PlayerFactory, CourseFactory, GameFactory) {

         $scope.clearLocalData = function () {
             PlayerFactory.getList(false).then(function (response) {
                 console.log(response);
                 var list = response.players;
                 for (var i = 0; i < list.length; i++) {
                     PlayerFactory.delete(list[i]._id).then(function (response) { console.log(response); });
                 }
             }).catch( function (err) {
                 console.error(err);
             });
             
             CourseFactory.getList(false).then(function (response) {
                 console.log(response);
                 var list = response.courses;
                 for (var i = 0; i < list.length; i++) {
                     CourseFactory.delete(list[i]._id).then(function (response) { console.log(response); });
                 }
             }).catch( function (err) {
                 console.error(err);
             });

         }
     }]);

discGolfControllers.controller(
    'GameController', 
    ['$scope', '$routeParams','$http', '$location', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, $routeParams, $http, $location, PlayerFactory, CourseFactory, GameFactory) {

         $scope.gameId = $routeParams.gameId;
         if ($scope.gameId !== undefined) {
             $scope.game = GameFactory.get($scope.gameId);
             $scope.course = CourseFactory.get($scope.game.courseId);
         }

         $scope.gameList = GameFactory.getList();
         $scope.playerList = {};

         $scope.getCourse = function (courseId) {
             return CourseFactory.get(courseId);
         }

         $scope.getHoleList = function (courseId) {
             var course = courseId !== undefined ? CourseFactory.get(courseId) : $scope.course;

             var holeList = [];
             for (var i = 1; i <= course.holeCount; i++) {
                 holeList.push(i);
             }

             return holeList;
         }

         $scope.getPlayerList = function (gameId) {
             if (gameId === undefined) {
                 gameId = $scope.game.id;
             }

             if ($scope.playerList[gameId] !== undefined) {
                 return $scope.playerList[gameId];
             }

             var game = GameFactory.get(gameId);
             var course = CourseFactory.get(game.courseId);

             var playerList = [];
             for (index in game.playerIds) {
                 var playerId = game.playerIds[index];

                 var player = PlayerFactory.get(playerId);
                 if (player !== undefined) {
                     var total = game.getPlayerTotalScore(playerId);

                     playerList.push({id: player.id, name: player.name, totalScore: total});
                 }
             }

             playerList.sort(function (player1, player2) { return player1.totalScore > player2.totalScore; });

             $scope.playerList[gameId] = playerList;

             return playerList;
         }

         $scope.getPlayerScore = function (gameId, playerId, hole) {
             var game = GameFactory.get(gameId);
             if (game.holeScores[hole] !== undefined) {
                 return game.holeScores[hole][playerId];
             }
         }

         $scope.getTotalPar = function (courseId) {
             var course = courseId !== undefined ? CourseFactory.get(courseId) : $scope.course;

             var totalPar = 0;
             for (hole in course.holes) {
                 totalPar += Number(course.holes[hole].par);
             }

             return totalPar;
         }

         $scope.getTotalDistance = function (courseId) {
             var course = courseId !== undefined ? CourseFactory.get(courseId) : $scope.course;

             var totalDistance = 0;
             for (hole in $scope.course.holes) {
                 totalDistance += Number($scope.course.holes[hole].distance);
             }

             return totalDistance;
         }

         $scope.getHolePar = function (courseId, hole) {
             var course = CourseFactory.get(courseId);

             if (course.holes[hole] !== undefined) {
                 return course.holes[hole].par;
             }
         }

         $scope.isGameOver = function (gameId) {
             var game = gameId !== undefined ? GameFactory.get(gameId) : $scope.game;
             var course = gameId !== undefined ? CourseFactory.get(game.courseId) : $scope.course;

             var lastHolePlayed = game.getLastHolePlayed();
             return lastHolePlayed == course.holeCount;
         }

         $scope.deleteGame = function (gameId) {
             GameFactory.delete(gameId);
         }

         $scope.resumeGame = function (gameId) {
             var game = gameId !== undefined ? GameFactory.get(gameId) : $scope.game;

             var hole = game.getLastHolePlayed();
             $location.path('games/' + game.id + '/' + hole);
         }
     }]);

discGolfControllers.controller(
    'CourseController', 
    ['$scope', '$routeParams', '$location', 'CourseFactory',
     function ($scope, $routeParams, $location, CourseFactory) {

         $scope.courseId = $routeParams.courseId;
         if ($scope.courseId !== undefined) {
             $scope.courseOriginal = CourseFactory.get($scope.courseId);
             $scope.course = angular.copy($scope.courseOriginal);
         }

         $scope.courseList = CourseFactory.getList();

         $scope.editCourse = function (courseId) {
             navigateToCourse(courseId);
         }

         $scope.deleteCourse = function (courseId) {
             CourseFactory.delete(courseId);
         }

         $scope.addCourse = function () {
             var course = CourseFactory.create();
             navigateToCourse(course.id);
         }

         $scope.getHoleList = function (courseId) {
             var course = courseId !== undefined ? CourseFactory.get(courseId) : $scope.course;

             var holeList = [];
             for (var i = 1; i <= course.holeCount; i++) {
                 holeList.push(i);
             }

             return holeList;
         }

         $scope.getHolePar = function (courseId, hole) {
             var course = courseId !== undefined ? CourseFactory.get(courseId) : $scope.course;

             if (course.holes[hole] !== undefined) {
                 return course.holes[hole].par;
             }
         }

         $scope.getHoleDistance = function (courseId, hole) {
             var course = courseId !== undefined ? CourseFactory.get(courseId) : $scope.course;

             if (course.holes[hole] !== undefined) {
                 return course.holes[hole].distance;
             }
         }

         $scope.save = function () {
             CourseFactory.update($scope.course);
             navigateToCourse();
         }

         $scope.cancel = function () {
             navigateToCourse();
         }

         function navigateToCourse (courseId) {
             var path = 'courses/';
             if (courseId !== undefined) {
                 path += courseId;
             }

             $location.path(path);
         }
     }]);