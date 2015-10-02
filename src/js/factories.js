var discGolfFactories = angular.module('discGolfFactories', []);

discGolfFactories.factory(
    'PouchDBFactory',
    ['$q',
     function ($q) {
         var service = {};

         // types of objects allowed in the database
         service.types = { player: 'player', course: 'course', hole: 'hole', game: 'game', gamePlayer: 'gamePlayer', score: 'score' };

         // create the database and indexes
         service.db = new PouchDB('discGolfDatabase');

         service.createIndexes = function () {
             return $q.when(service.db.createIndex({
                 index: { fields: ['type', 'isActive'] }
             }));
         }

         service.createIndexes().then(function(result) {
             console.log(result);
         }).catch (function (err) {
             console.error(err);
         });

         // compact the database
         service.db.compact().then(function (response) {
             console.log(response);
         });

         service.deleteAllIndexes = function () {
             service.db.getIndexes().then(function (result) {
                 console.log(result);

                 var indexes = result.indexes;
                 for (var i = 0; i < indexes.length; i++) {
                     if (indexes[i].name != "_all_docs") {
                         service.db.deleteIndex(indexes[i]).then(function(response) { console.log (response); });    
                     }
                 }
             }).catch(function (err) {
                 console.error(err);
             });
         }

         service.getByType = function (type, listName, activeOnly) {
             var selector = { type: type };
             if (activeOnly === true) {
                 selector.isActive = activeOnly;
             }

             var deferred = $q.defer();
             var result = {};

             service.db.find({ selector: selector }).then (function (response) {
                 result[listName] = response.docs;
                 deferred.resolve(result);
             }).catch ( function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.deleteObject = function (id, setInactive) {
             if (setInactive === undefined) { setInactive = false; }

             var deferred = $q.defer()

             service.db.get(id).then(function(object) {
                 if (setInactive) {
                     object.isActive = false;
                     return service.db.put(object);
                 }
                 else {
                     return service.db.remove(object);    
                 }
             }).then(function (response) {
                 deferred.resolve(response);
             }).catch(function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.deleteObjects = function (objects, setInactive) {
             if (setInactive === undefined) { setInactive = false; }

             for (index in objects) {
                 if (setInactive) {
                     objects[index].isActive = false;
                 }
                 else {
                     objects[index]._deleted = true;     
                 }
             }

             return $q.when(service.db.bulkDocs(objects));
         }
         
         service.updateObject = function (object) {
             var deferred = $q.defer();
             
             service.db.put(object).then( function (response) {
                 object._id = response.id;
                 object._rev = response.rev;
                 
                 deferred.resolve(object);
             }).catch( function (err) {
                 deferred.reject(err);
             });
             
             return deferred.promise;
         }

         service.createUniqueId = function () {
             return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
                 return Math.floor((1 + Math.random()) * 0x10000)
                     .toString(16)
                     .substring(1,3);
             });
         }

         return service;
     }]
);

discGolfFactories.factory(
    'PlayerFactory',
    ['$q', 'PouchDBFactory', 
     function ($q, PouchDBFactory) {
         var service = {};

         service.createIndexes = function () {
             return $q.when(PouchDBFactory.db.createIndex({
                 index: { fields: [ 'type', 'player_id' ]}
             }));
         }

         service.createIndexes().then(function(result) {
             console.log(result);
         }).catch (function (err) {
             console.error(err);
         });

         service.getList = function (activeOnly) {
             if (activeOnly === undefined) { activeOnly = true; }

             return PouchDBFactory.getByType(PouchDBFactory.types.player, 'players', activeOnly);
         }

         service.get = function (id) {
             var deferred = $q.defer();
             var result = {};

             PouchDBFactory.db.get(id).then( function (object) {
                 result.player = object;
                 deferred.resolve(result);
             }).catch( function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.create = function (name) {
             var player = {
                 _id: PouchDBFactory.createUniqueId(),
                 type: PouchDBFactory.types.player,
                 name: name,
                 isActive: true
             };

             return $q.when(PouchDBFactory.db.put(player));
         }

         service.update = function (player) {
             return PouchDBFactory.updateObject(player);
         }

         service.delete = function (id) {
             var deferred = $q.defer();

             // check to see if the player is associated with any games
             PouchDBFactory.db.find({ 
                 selector: { 
                     type: PouchDBFactory.types.gamePlayer, 
                     player_id: id
                 }
             }).then( function (response) {
                 // if there are associated games, then set the player as inactive
                 return PouchDBFactory.deleteObject(id, response.docs.length > 0);
             }).then ( function (response) {
                 deferred.resolve(response);
             }).catch( function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.cleanupInactivePlayers = function () {
             PouchDBFactory.db.find({ 
                 selector: { 
                     type: PouchDBFactory.types.player,
                     isAcitve: false
                 }
             }).then ( function (response) {
                 var players = response.docs;
                 for (var i = 0; i < players.length; i++) {
                     service.delete(players[i]._id);
                 }
             }).catch ( function (err) {
                 console.log(err);
             });
         }

         return service;
     }]
);

discGolfFactories.factory(
    'CourseFactory',
    ['$q', 'PouchDBFactory', 
     function ($q, PouchDBFactory) {
         var service = {};

         service.createIndexes = function () {
             return $q.when(PouchDBFactory.db.createIndex({
                 index: { fields: [ 'type', 'course_id' ] }
             }));
         }

         service.createIndexes().then(function(result) {
             console.log(result);
         }).catch (function (err) {
             console.error(err);
         });

         service.getList = function (activeOnly) {
             if (activeOnly === undefined) { activeOnly = true; }

             return PouchDBFactory.getByType(PouchDBFactory.types.course, 'courses', activeOnly);
         }

         service.get = function (id) {
             var deferred = $q.defer();

             var result = {};

             PouchDBFactory.db.get(id).then( function (response) {
                 result.course = response;
                 return service.getCourseHoles(result.course._id);
             }).then(function (response) {
                 result.holes = response;
                 deferred.resolve(result);
             }).catch(function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.getCourseHoles = function (course_id) {
             var deferred = $q.defer();

             PouchDBFactory.db.find({
                 selector: {
                     type: PouchDBFactory.types.hole,
                     course_id: course_id
                 }
             }).then(function (response) {
                 var holes = response.docs;
                 holes.sort(function (hole1, hole2) {
                     return hole1.holeNumber - hole2.holeNumber;
                 });

                 deferred.resolve(holes);
             }).catch(function (err) {
                 console.error(err);
                 deferred.reject(err);
             })

             return deferred.promise;
         }

         service.create = function (name, holeCount) {
             var deferred = $q.defer();

             var course = {
                 _id: PouchDBFactory.createUniqueId(),
                 type: PouchDBFactory.types.course,
                 name: name,
                 isActive: true
             };

             var holes = [];
             for (var i = 0; i < holeCount; i++) {
                 holes.push({
                     _id: PouchDBFactory.createUniqueId(), 
                     type: PouchDBFactory.types.hole, 
                     holeNumber: (i+1), 
                     course_id: course._id });
             }

             var result = {};

             PouchDBFactory.db.put(course).then( function (response) {
                 result.course = response;
                 return PouchDBFactory.db.bulkDocs(holes);
             }).then(function (response) {
                 result.holes = response;   
                 deferred.resolve(result);
             }).catch(function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.update = function (course) {
             return PouchDBFactory.updateObject(course);
         }

         service.updateHole = function (hole) {
             return PouchDBFactory.updateObject(hole);
         }

         service.delete = function (id) {
             var deferred = $q.defer()

             var result = {};

             var softDelete = false;

             // Find out if the course is associated with any games
             PouchDBFactory.db.find({
                 selector: {
                     type: PouchDBFactory.types.game, 
                     course_id: id
                 }
             }).then ( function (response) {
                 var games = response.docs;

                 // if there are games, then soft delete
                 softDelete = games.length > 0;
                 return PouchDBFactory.deleteObject(id, softDelete);
             }).then ( function (response) {
                 result.course = response;

                 // get the holes for the course
                 return service.getCourseHoles(id);
             }).then ( function (holes) {
                 return PouchDBFactory.deleteObjects(holes, softDelete);
             }).then (function (response) {
                 result.holes = response;

                 deferred.resolve(result);
             }).catch (function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.cleanupInactiveCourses = function () {

             PouchDBFactory.db.find({ 
                 selector: { 
                     type: PouchDBFactory.types.course,
                     isAcitve: false
                 }
             }).then ( function (response) {
                 var courses = response.docs;
                 for (var i = 0; i < courses.length; i++) {
                     service.delete(courses[i]._id);
                 }
             }).catch ( function (err) {
                 console.log(err);
             });
         }

         return service;
     }]
);

discGolfFactories.factory(
    'GameFactory',
    ['$q', 'PouchDBFactory', 
     function ($q, PouchDBFactory) {
         var service = {};

         service.createIndexes = function () {
             return $q.when(PouchDBFactory.db.createIndex({
                 index: { fields: [ 'type', 'game_id', 'hole_id', 'player_id' ] }
             }));
         }

         service.createIndexes().then(function(result) {
             console.log(result);
         }).catch (function (err) {
             console.error(err);
         });

         service.getList = function () {
             return PouchDBFactory.getByType(PouchDBFactory.types.game, 'games');
         }

         service.get = function (id) {
             var deferred = $q.defer();

             var result = {};

             PouchDBFactory.db.get(id).then( function (response) {
                 result.game = response;

                 return PouchDBFactory.db.find({
                     selector: { type: PouchDBFactory.types.gamePlayer, game_id: result.game._id }
                 });
             }).then ( function (response) {
                 var gamePlayers = response.docs;

                 var players = [];
                 for (index in gamePlayers) {
                     players.push(PouchDBFactory.db.get(gamePlayers[index].player_id));
                 }

                 return $q.all(players);
             }).then( function (response) {
                 result.players = response;
                 
                 return PouchDBFactory.db.find({
                     selector: {
                         type: PouchDBFactory.types.score,
                         game_id: result.game._id
                     }
                 });

                 //return service.getScores(result.game._id);
             }).then ( function (response) {
                 result.scores = response.docs;

                 deferred.resolve(result);
             }).catch (function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

//         service.getScores = function (gameId, holeId) {
//             var deferred = $q.defer();
//
//             var selector = {
//                 type: PouchDBFactory.types.score,
//                 game_id: gameId
//             };
//
//             if (holeId !== undefined) {
//                 selector.hole_id = holeId;
//             }
//
//             var result = {};
//             var totals = {};
//             PouchDBFactory.db.find({
//                 selector: selector
//             }).then( function (response) {
//                 var scores = response.docs;
//                 for (var i = 0; i < scores.length; i++) {
//                     var score = scores[i];
//
//                     if (result[score.hole_id] === undefined) { result[score.hole_id] = []; }
//                     result[score.hole_id].push(score);
//
//                     if (totals[score.player_id] === undefined) { totals[score.player_id] = { player_id: score.player_id, totalScore: 0 }; }
//                     totals[score.player_id].totalScore += score.score;
//                 }
//
//                 result.totals = Object.keys(totals).map(function (key) { return totals[key] });
//
//                 deferred.resolve(result);
//             }).catch( function (err) {
//                 deferred.reject(err);
//             });
//
//             return deferred.promise;
//         }

         service.create = function (courseId, playerIds) {
             var deferred = $q.defer();

             var game = {
                 _id: PouchDBFactory.createUniqueId(),
                 type: PouchDBFactory.types.game,
                 date: new Date(),
                 course_id: courseId
             };

             var gamePlayers = [];
             for (index in playerIds) {
                 var playerId = playerIds[index];
                 gamePlayers.push({ 
                     _id: PouchDBFactory.createUniqueId(), 
                     type: PouchDBFactory.types.gamePlayer,
                     game_id: game._id, 
                     player_id: playerId 
                 });
             }

             var result = {};

             // create the game
             PouchDBFactory.db.put(game).then(function (response) {
                 result.game = response;

                 // add the players
                 return PouchDBFactory.db.bulkDocs(gamePlayers);
             }).then(function (response) {
                 result.gamePlayers = response;
                 deferred.resolve(result);
             }).catch(function (err) {
                 console.error(err);
                 deferred.reject(err);
             });

             return deferred.promise;
         }

         service.createScore = function (gameId, holeId, playerId, score) {
             var score = {
                 _id: PouchDBFactory.createUniqueId(),
                 type: PouchDBFactory.types.score,
                 game_id: gameId,
                 hole_id: holeId,
                 player_id: playerId,
                 value: score
             };
             
             var deferred = $q.defer();
             PouchDBFactory.db.put(score).then(function (response) {
                 return PouchDBFactory.db.get(response.id);
             }).then( function (response) {
                 var result = { score: response};
                 deferred.resolve(result);
             }).catch( function (err) {
                 console.error(err);
                 deferred.reject(err);
             });
             
             return deferred.promise;
         }

         service.update = function (game) {
             return PouchDBFactory.updateObject(game);
         }

         service.updateScore = function (score) {
             return PouchDBFactory.updateObject(score);
         }

         service.delete = function (id) {
             var deferred = $q.defer()

             var result = {};

             PouchDBFactory.db.find({
                 selector: {
                     type: PouchDBFactory.types.gamePlayer, 
                     game_id: id
                 }
             }).then( function (players) {
                 return PouchDBFactory.deleteObjects(players.docs);
             }).then ( function (response) {
                 result.gamePlayers = response;

                 return PouchDBFactory.db.find({ selector: { type: PouchDBFactory.types.score, game_id: id } });
             }).then ( function (scores) {
                 return PouchDBFactory.deleteObjects(scores.docs);
             }).then ( function (response) {
                 result.scores = response;

                 return PouchDBFactory.deleteObject(id);
             }).then ( function (response) {
                 result.game = response;
                 deferred.resolve(result);
             }).catch ( function (err) {
                 console.error(err);
                 deferred.reject(err);
             })

             return deferred.promise;
         }

         return service;
     }]
);
