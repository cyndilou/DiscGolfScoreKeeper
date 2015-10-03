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

         // Route parameters
         $scope.gameId = $routeParams.gameId;
         $scope.holeNumber = Number($routeParams.basket);

         // Get the game info based on the route parameters
         GameFactory.get($scope.gameId).then(function (response) {
             $scope.game = response.game;
             $scope.scores = response.scores;
             $scope.players = response.players;

             // Organize the data into an object that makes sense for the basket data
             var basketDataMap = {};
             for (playerIndex in response.players) {
                 var player = response.players[playerIndex];
                 if (basketDataMap[player._id] === undefined) { basketDataMap[player._id] = {}; }
                 basketDataMap[player._id].player = player;
             }

             // Add the score info to the basket data
             for (scoreIndex in response.scores) {
                 var score = response.scores[scoreIndex];

                 if (basketDataMap[score.player_id].scores === undefined) { basketDataMap[score.player_id].scores = {}; }
                 basketDataMap[score.player_id].scores[score.hole_id] = score;
             }

             // Turn it into an array so that it can be easily sorted
             $scope.basketData = Object.keys(basketDataMap).map(function (key) { return basketDataMap[key]; });

             // Now get the course info
             return CourseFactory.get($scope.game.course_id);
         }).then( function (response) {
             $scope.course = response.course;
             $scope.holeCount = response.holes.length;

             // Get the current and last hole
             for (holeIndex in response.holes) {
                 var hole = response.holes[holeIndex];
                 if (hole.holeNumber == $scope.holeNumber) {
                     $scope.currentHole = hole;
                 }

                 if (hole.holeNumber == ($scope.holeNumber - 1)) {
                     $scope.lastHole = hole;
                 }
             }

             // Calculate some stats for each player
             for (dataIndex in $scope.basketData) {
                 var dataObject = $scope.basketData[dataIndex];
                 $scope.calculatePlayerScoreData(dataObject);
             }

             // Determine the max score for this hole
             var highScore = $scope.currentHole.par !== undefined ? $scope.currentHole.par * 5 : 15;
             $scope.scoreOptions = [];
             for (var i = 1; i <= highScore; i++) {
                 $scope.scoreOptions.push(i);
             }
         });

         $scope.calculatePlayerScoreData = function (basketDataObject) {
             if (basketDataObject.scores === undefined) { basketDataObject.scores = {}; }

             basketDataObject.currentHoleScore = -1;
             if (basketDataObject.scores[$scope.currentHole._id] !== undefined) {
                 basketDataObject.currentHoleScore = basketDataObject.scores[$scope.currentHole._id].value;
             }

             basketDataObject.lastHoleScore = -1;
             if ($scope.lastHole !== undefined && basketDataObject.scores[$scope.lastHole._id] !== undefined) {
                 basketDataObject.lastHoleScore = basketDataObject.scores[$scope.lastHole._id].value;
             }

             basketDataObject.totalScore = 0;
             for (index in basketDataObject.scores) {
                 basketDataObject.totalScore += basketDataObject.scores[index].value;
             }
         }

         $scope.updateHole = function () {
             CourseFactory.updateHole($scope.currentHole).then( function (response) {
                 console.log(response);
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.setPlayerScore = function (dataObject, value) {
             var score = dataObject.scores[$scope.currentHole._id];
             if (score !== undefined) {
                 score.value = value;
                 GameFactory.updateScore(score).then(function (response) {
                     $scope.calculatePlayerScoreData(dataObject);
                 });
             }
             else {
                 if (dataObject.scores === undefined) { dataObject.scores = {}; }

                 GameFactory.createScore($scope.game._id, $scope.currentHole._id, dataObject.player._id, value).then(function (response) {
                     dataObject.scores[$scope.currentHole._id] = response.score;
                     $scope.calculatePlayerScoreData(dataObject);
                 });
             }
         }

         $scope.gameOver = function () {
             $scope.game.gameOver = true;
             GameFactory.update($scope.game).then( function (response) {
                $location.path('games/' + $scope.game._id);
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.isHoleComplete = function () {
             if ($scope.basketData === undefined) {
                 return false;
             }

             for (var i = 0; i < $scope.basketData.length; i++) {
                 if ($scope.basketData[i].currentHoleScore == -1) {
                     return false;
                 }
             }

             return true;
         }

         $scope.nextHole = function () {
             $scope.game.lastHolePlayed = $scope.holeNumber+1;
             GameFactory.update($scope.game).then( function (response) {
                $location.path('games/' + $scope.game._id + '/' + ($scope.holeNumber+1));    
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.previousHole = function () {
             $location.path('games/' + $scope.game._id + '/' + ($scope.holeNumber-1));
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
    ['$scope', '$routeParams','$http', '$location', '$q', 'PlayerFactory', 'CourseFactory', 'GameFactory',
     function ($scope, $routeParams, $http, $location, $q, PlayerFactory, CourseFactory, GameFactory) {

         $scope.games = {};
         $scope.courses = {};
         
         $scope.loadGame = function (gameId) {
             if ($scope.games[gameId] === undefined) {
                 GameFactory.get(gameId).then( function (response) {
                     $scope.games[gameId] = {
                         game: response.game,
                         playerScores: $scope.resolvePlayerScores(response.players, response.scores)
                     }

                     $scope.loadCourses([response.game.course_id]);
                 }).catch( function (err) {
                     console.error(err);
                 });
             }
         }

         $scope.gameId = $routeParams.gameId;
         if ($scope.gameId !== undefined) {
             $scope.loadGame($scope.gameId);
         }
         else {
             GameFactory.getList().then( function (response) {
                 $scope.gameList = response.games;

                 var courses = [];
                 for (var i = 0; i < response.games.length; i++) {
                     if (courses.indexOf(response.games[i].course_id) == -1) {
                         courses.push(response.games[i].course_id);
                     }
                 }

                 $scope.loadCourses(courses);
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.resolvePlayerScores = function (players, scores) {
             var playerScores = {};
             for (var i = 0; i < players.length; i++) {
                 playerScores[players[i]._id] = { player: players[i], scoresByHole: {}, totalScore: 0 };
             }

             for (var i = 0; i < scores.length; i++) {
                 var score = scores[i];
                 playerScores[score.player_id].scoresByHole[score.hole_id] = score;
                 playerScores[score.player_id].totalScore += score.value;
             }

             return Object.keys(playerScores).map(function (key) { return playerScores[key]; });
         }

         $scope.loadCourses = function (courseIds) {
             var coursesToLoad = [];
             for (var i = 0; i < courseIds.length; i++) {
                 if ($scope.courses[courseIds[i]] === undefined) {
                     coursesToLoad.push(CourseFactory.get(courseIds[i]));
                 }
             }

             $q.all(coursesToLoad).then( function (response) {
                 for (var i = 0; i < response.length; i++) {
                     $scope.courses[response[i].course._id] = {
                         course: response[i].course,
                         holes: response[i].holes
                     };
                 }
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.getTotalPar = function (courseId) {
             var course = $scope.courses[courseId];
             if (course !== undefined) {
                 var totalPar = 0;
                 for (var i = 0; i < course.holes.length; i++) {
                     totalPar += Number(course.holes[i].par || 0);
                 }

                 return totalPar;
             }
         }

         $scope.getTotalDistance = function (courseId) {
             var course = $scope.courses[courseId];
             if (course !== undefined) {
                 var totalDistance = 0;
                 for (var i = 0; i < course.holes.length; i++) {
                     totalDistance += Number(course.holes[i].distance || 0);
                 }

                 return totalDistance;
             }
         }

         $scope.deleteGame = function (game) {
             GameFactory.delete(game._id).then( function (response) {
                 console.log(response);
                 
                 var index = $scope.gameList.indexOf(game);
                 if (index != -1) {
                     $scope.gameList.splice(index, 1);
                 }
             }).catch( function (err) {
                 console.error(err);
             });
         }

         $scope.isGameOver = function (gameId) {
             if ($scope.games[gameId] === undefined) {
                 return false;
             }
             
             var isGameOver = $scope.games[gameId].game.gameOver === true;
             return $scope.games[gameId].game.gameOver === true;
         }
         
         $scope.resumeGame = function (gameId) {
             if (gameId === undefined) {
                 gameId = $scope.gameId;
             }
             
             var lastHolePlayed = $scope.games[gameId].game.lastHolePlayed || 1;
             
             $location.path('games/' + $scope.games[gameId].game._id + '/' + lastHolePlayed);
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