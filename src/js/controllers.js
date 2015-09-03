var discGolfControllers = angular.module('discGolfControllers', []);

discGolfControllers.controller(
    'PlayerController', 
    ['$scope', '$http', 'PlayerFactory',
     function ($scope, $http, PlayerFactory) {

         var playerList = PlayerFactory.getList();

         $scope.editablePlayerList = [];
         angular.forEach(playerList, function (value, index) {
             this.push({
                 player: PlayerFactory.get(value.id),
                 editMode: false
             });
         }, $scope.editablePlayerList);

         $scope.editPlayer = function (item) {
             item.editMode = true;
             item.temp = {
                 name: item.player.name
             };
         };

         $scope.endEdit = function (item, saveChanges) {
             if (saveChanges == true) {
                 item.player.name = item.temp.name;
                 PlayerFactory.update(item.player);
             }

             item.temp = null;
             item.editMode = false;
         };

         $scope.addPlayer = function () {
             var player = PlayerFactory.createPlayer("New Player");

             var newItem = {
                 player: player,
                 editMode: false
             };

             $scope.editablePlayerList.push(newItem);
             $scope.editPlayer(newItem);
         }

         $scope.deletePlayer = function (item) {
             for (var i = 0; i < $scope.editablePlayerList.length; i++) {
                 if (item.player.id == $scope.editablePlayerList[i].player.id) {
                     $scope.editablePlayerList.splice(i, 1);
                     break;
                 }
             }

             PlayerFactory.delete(item.player.id);
         }
     }]);

discGolfControllers.controller(
    'NewGameController', 
    ['$scope', '$http', '$location', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, $http, $location, PlayerFactory, CourseFactory, GameFactory) {

         $scope.newPlayerName = '';
         $scope.newCourseName = '';
         $scope.newCourseHoleCount = 9;

         $scope.courseList = CourseFactory.getList();
         $scope.selectedCourseId;

         $scope.selectedPlayers = [];

         $scope.playerList = PlayerFactory.getList();

         $scope.addNewPlayer = function () {
             var player = PlayerFactory.createPlayer($scope.newPlayerName);

             $scope.selectedPlayers.push(player.id);
             $scope.newPlayerName = '';
         };

         $scope.addCourse = function () {
             var course = CourseFactory.createCourse($scope.newCourseName, $scope.newCourseHoleCount);

             $scope.selectedCourseId = course.id;
             $scope.newCourseName = '';
         }

         $scope.toggleSelection = function toggleSelection(player) {
             var idx = $scope.selectedPlayers.indexOf(player.id);
             if (idx > -1) {
                 $scope.selectedPlayers.splice(idx, 1);
             } else {
                 $scope.selectedPlayers.push(player.id);
             }
         };

         $scope.toOptionDisplay = function (course) {
             return course.name + ' (' + course.holeCount + ' holes)';
         };

         $scope.onStartGame = function () {
             var game = GameFactory.createGame($scope.selectedCourseId, $scope.selectedPlayers);

             $location.path('games/' + game.id + '/1');
         };
     }]);

discGolfControllers.controller(
    'GameController', 
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

         $scope.getTotalDistance = function () {
             var totalDistance = 0;
             for (hole in $scope.course.holes) {
                 totalDistance += Number($scope.course.holes[hole].distance);
             }

             return totalDistance;
         }

         $scope.getTotalPar = function () {
             var totalPar = 0;
             for (hole in $scope.course.holes) {
                 totalPar += Number($scope.course.holes[hole].par);
             }

             return totalPar;
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

         $scope.isGameOver = function () {
             var lastHolePlayed = $scope.game.getLastHolePlayed();
             return lastHolePlayed == $scope.course.holeCount;
         }

         $scope.onResumeGame = function () {
             var hole = $scope.game.getLastHolePlayed() + 1;
             $location.path('games/' + $scope.game.id + '/' + hole);
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

         $scope.getHoleList = function () {
             var holeList = [];
             for (var i = 1; i <= $scope.course.holeCount; i++) {
                 holeList.push(i);
             }

             return holeList;
         }
     }]);

discGolfControllers.controller(
    'SettingsController', 
    ['$scope', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, PlayerFactory, CourseFactory, GameFactory) {

         $scope.clearLocalData = function () {
             PlayerFactory.deleteAll();
             CourseFactory.deleteAll();
             GameFactory.deleteAll();
         }
     }]);

discGolfControllers.controller(
    'GameListController', 
    ['$scope', 'CourseFactory', 'GameFactory',
     function ($scope, CourseFactory, GameFactory) {

         $scope.gameList = GameFactory.getList();

         $scope.getCourseName = function (courseId) {
             var course = CourseFactory.get(courseId);
             return course.name;
         }

     }]);