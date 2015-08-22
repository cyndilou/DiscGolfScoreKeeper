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