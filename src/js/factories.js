var discGolfFactories = angular.module('discGolfFactories', []);

discGolfFactories.factory(
    'ObjectFactory',
    function () {
        var ObjectFactory = function (listKey) {
            this.listKey = listKey;

            this.list = loadList(this.listKey);
            this.cache = {};

            this._loadObject = function (id) {
                return JSON.parse(localStorage.getItem(id));
            }

            this._saveObject = function (object) {
                localStorage.setItem(object.id, JSON.stringify(object));
            }

            this._deleteObject = function (id) {
                localStorage.removeItem(id);
            }

            this._getList = function () {
                return this.list;
            }

            this._get = function (id) {    
                if (this.cache[id] === undefined) {
                    this.cache[id] = this._loadObject(id);
                }

                return this.cache[id];
            }

            this._create = function (object) {        
                this.cache[object.id] = object;
                this.list[object.id] = object.toListItem();

                this._saveObject(object);
                saveList(this.listKey, this.list);
            }

            this._update = function (object) {
                this.list[object.id] = object.toListItem();
                this.cache[object.id] = object;

                this._saveObject(object);
                saveList(this.listKey, this.list);
            }

            this._delete = function (id) {
                var object = this._get(id);
                if (hasReferences(object)) {
                    object['isDeleted'] = true;
                    this.update(object);
                }
                else {
                    delete this.cache[id];
                    this._deleteObject(id);
                }

                delete this.list[id];
                saveList(this.listKey, this.list);
            }

            this._deleteAll = function () {
                for (objectId in this.list) {
                    this._deleteObject(objectId);
                }

                this.list = {};
                this.cache = {};

                deleteList(this.listKey);
            }

            this._addReference = function (id, referenceId) {
                var object = this._get(id);
                if (object['references'] === undefined) {
                    object['references'] = {};
                }

                object['references'][referenceId] = referenceId;
                this._saveObject(object);
            }

            this._removeReference = function (id, referenceId) {
                var object = this._get(id);
                if (object['references'] !== undefined) {

                    delete object['references'][referenceId];
                    this._saveObject(object);

                    if (object['isDeleted'] === true) {
                        this._delete(id);
                    }
                }
            }

            function loadList (listKey) {
                return JSON.parse(localStorage.getItem(listKey)) || {};
            }

            function saveList (listKey, list) {
                localStorage.setItem(listKey, JSON.stringify(list));
            }

            function deleteList (listKey) {
                localStorage.removeItem(listKey);
            }

            function hasReferences (object) {
                var referencesList = object['references'];
                if ((referencesList === undefined) || (Object.keys(referencesList).length == 0)) {
                    return false;
                }

                for (index in referencesList) {
                    if (localStorage.getItem(referencesList[index]) != null) {
                        return true;
                    }
                }

                return false;
            }
        };

        return ObjectFactory;
    }
);

discGolfFactories.factory(
    'PlayerFactory', 
    function (ObjectFactory) {
        var service = new ObjectFactory('playerList');

        service._loadObject = function (id) {
            var item = localStorage.getItem(id);
            if (item != null) {
                return (new Player(JSON.parse(item)));
            }
        }

        service.getList = function () {
            return service._getList();
        }

        service.get = function (id) {
            return service._get(id);
        }

        service.create = function (name) {
            var player = new Player({name: name});

            service._create(player);

            return player;
        }
        
        service.update = function (object) {
            return service._update(object);
        }
        
        service.delete = function (id) {
            return service._delete(id);
        }

        return service;
    }
);

discGolfFactories.factory(
    'CourseFactory', 
    function (ObjectFactory) {
        var service = new ObjectFactory('courseList');

        service._loadObject = function (id) {
            var item = localStorage.getItem(id);
            if (item != null) {
                return (new Course(JSON.parse(item)));
            }
        }

        service.getList = function () {
            return service._getList();
        }

        service.get = function (id) {
            return service._get(id);
        }

        service.create = function (name, holeCount) {
            var course = new Course({name: name, holeCount: holeCount});

            service._create(course);

            return course;
        }
        
        service.update = function (object) {
            return service._update(object);
        }
        
        service.delete = function (id) {
            return service._delete(id);
        }

        return service;
    }
);

discGolfFactories.factory(
    'GameFactory', 
    ['ObjectFactory', 'CourseFactory', 'PlayerFactory',
     function (ObjectFactory, CourseFactory, PlayerFactory) {
         var service = new ObjectFactory('gameList');

         service._loadObject = function (id) {
             var item = localStorage.getItem(id);
             if (item != null) {
                 return (new Game(JSON.parse(item)));
             }
         }

         service.getList = function () {
             return service._getList();
         }

         service.get = function (id) {
             return service._get(id);
         }

         service.create = function (courseId, playerIds) {
             var game = new Game({courseId: courseId, playerIds: playerIds});

             CourseFactory._addReference(courseId, game.id);

             for (var i = 0; i < playerIds.length; i++) {
                 PlayerFactory._addReference(playerIds[i], game.id);
             }

             service._create(game);

             return game;
         }
         
         service.update = function (object) {
            return service._update(object);
        }

         service.delete = function (id) {
             var game = this._get(id);

             CourseFactory._removeReference(game.courseId, game.id);

             for (var i = 0; i < game.playerIds.length; i++) {
                 PlayerFactory._removeReference(game.playerIds[i], game.id);
             }

             service._delete(id);
         }

         return service;
     }]);