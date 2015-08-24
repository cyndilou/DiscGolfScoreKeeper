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
             
             this.push ({id: player.id, name: player.name, lastHoleScore: lastHoleScore});
         }, $scope.gamePlayers);

         var highScore = ($scope.course.holes[$scope.holeNumber] !== undefined ? $scope.course.holes[$scope.holeNumber].par * 5 : 15);
         
         $scope.scoreOptions = [];
         for (var i = 1; i <= highScore; i++) {
             $scope.scoreOptions.push(i);
         }
         
         $scope.getPlayerTotal = function (playerId) {
             var total = 0;
             
             for (hole in $scope.game.holeScores) {
                 total += $scope.game.holeScores[hole][playerId] || 0;
             }
             
             return total;
         }
         
         $scope.updateCourse = function () {
             CourseFactory.update($scope.course);
         }
         
         $scope.setPlayerScore = function (player, score) {
             $scope.game.setPlayerScore($scope.holeNumber, player.id, score);
             GameFactory.update($scope.game);
         }

         $scope.gameOver = function () {
             $location.path('games/id');
         }

         $scope.nextHole = function () {
             $location.path('games/' + $scope.game.id + '/' + ($scope.holeNumber+1));
         }

         $scope.previousHole = function () {
             $location.path('games/' + $scope.game.id + '/' + ($scope.holeNumber-1));
         }
     }]);