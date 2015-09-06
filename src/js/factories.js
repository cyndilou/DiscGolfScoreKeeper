var discGolfFactories = angular.module('discGolfFactories', []);

discGolfFactories.factory(
    'ObjectFactory',
    function () {
        var ObjectFactory = function (listKey) {
            this.listKey = listKey;

            this.list = loadList(this.listKey);
            this.cache = {};

            this.loadObject = function (id) {
                return JSON.parse(localStorage.getItem(id));
            }

            this.saveObject = function (object) {
                localStorage.setItem(object.id, JSON.stringify(object));
            }

            this.deleteObject = function (id) {
                localStorage.removeItem(id);
            }

            this.getList = function () {
                return this.list;
            }

            this.get = function (id) {    
                if (this.cache[id] === undefined) {
                    this.cache[id] = this.loadObject(id);
                }

                return this.cache[id];
            }

            this.create = function (object) {        
                this.cache[object.id] = object;
                this.list[object.id] = object.toListItem();

                this.saveObject(object);
                saveList(this.listKey, this.list);
            }

            this.update = function (object) {
                this.list[object.id] = object.toListItem();
                this.cache[object.id] = object;

                this.saveObject(object);
                saveList(this.listKey, this.list);
            }

            this.delete = function (id) {
                delete this.list[id];
                delete this.cache[id];

                this.deleteObject(id);
                saveList(this.listKey, this.list);
            }

            this.deleteAll = function () {
                for (objectId in this.list) {
                    this.deleteObject(objectId);
                }

                this.list = {};
                this.cache = {};

                deleteList(this.listKey);
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
        };

        return ObjectFactory;
    }
);

discGolfFactories.factory(
    'PlayerFactory', 
    function (ObjectFactory) {
        var service = new ObjectFactory('playerList');

        service.loadObject = function (id) {
            return (new Player(JSON.parse(localStorage.getItem(id))));
        }

        service.createPlayer = function (name) {
            var player = new Player({name: name});

            service.create(player);

            return player;
        }

        return service;
    }
);

discGolfFactories.factory(
    'CourseFactory', 
    function (ObjectFactory) {
        var service = new ObjectFactory('courseList');

        service.loadObject = function (id) {
            return (new Course(JSON.parse(localStorage.getItem(id))));
        }

        service.createCourse = function (name, holeCount) {
            var course = new Course({name: name, holeCount: holeCount});

            service.create(course);

            return course;
        }

        return service;
    }
);

discGolfFactories.factory(
    'GameFactory', 
    function (ObjectFactory) {
        var service = new ObjectFactory('gameList');
        
        service.loadObject = function (id) {
            return (new Game(JSON.parse(localStorage.getItem(id))));
        }

        service.createGame = function (courseId, playerIds) {
            var game = new Game({courseId: courseId, playerIds: playerIds});

            service.create(game);

            return game;
        }

        return service;
    });