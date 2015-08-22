var discGolfFactories = angular.module('discGolfFactories', []);

discGolfFactories.factory(
    'PlayersFactory', 
    function () {
        var service = {};

        service.getPlayers = function () {
            if (service.players === undefined) {
                load();
            }

            return service.players;
        }

        service.createPlayer = function (name) {
            var player = new Player(name);

            service.players[player.id] = player.toListItem();

            save();

            return player;
        }

        service.modifyPlayer = function (player) {
            service.players[player.id] = player.toListItem();

            save();
        }

        service.deletePlayer = function (player) {
            delete service.players[player.id];

            save();
        }

        function load () {
            service.players = {};
            //service.players = JSON.parse(localStorage.getItem('discGolfPlayerList')) || {};
        }

        function save () {
            //localStorage.setItem('discGolfPlayerList', JSON.stringify(service.players));
        }

        return service;
    });

discGolfFactories.factory(
    'CourseFactory', 
    function () {
        var service = {};

        service.getCourseList = function () {
            if (service.list === undefined) {
                loadList();
            }

            return service.list;
        }

        service.getCourse = function (courseId) {
            if (service.cache === undefined) {
                service.cache = {};
            }

            if (service.cache[courseId] === undefined) {
                loadCourse(courseId);
            }

            return service.cache[courseId];
        }

        service.createCourse = function (name, holeCount) {
            if (service.cache === undefined) {
                service.cache = {};
            }

            var course = new Course(name, holeCount);

            service.list[course.id] = course.toListItem();
            service.cache[course.id] = course;

            saveList();
            saveCourse(course);

            return course;
        }

        service.updateCourse = function (course) {
            service.list[course.id] = course.toListItem();

            saveList();
            saveCourse(course);
        }

        service.deleteCourse = function (courseId) {
            delete service.list[courseId];
            delete service.cache[courseId];

            deleteCourse(courseId);
            saveList();
        }

        function loadList () {
            service.list = {};
            //service.list = JSON.parse(localStorage.getItem('discGolfCouseList')) || {};
        }

        function saveList () {
            //localStorage.setItem('discGolfCouseList', JSON.stringify(service.list));
        }

        function loadCourse (courseId) {
            //service.cache[courseId] = JSON.parse(localStorage.getItem(courseId));
        }

        function saveCourse (course) {
            //localStorage.setItem(course.id, JSON.stringify(course));
        }

        function deleteCourse (courseId) {
            //localStorage.removeItem(courseId);
        }

        return service;
    });