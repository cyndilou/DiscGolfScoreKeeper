var discGolfControllers = angular.module('discGolfControllers', []);

discGolfControllers.controller(
    'PlayerController', 
    ['$scope', '$http', 'PlayersFactory',
     function ($scope, $http, PlayersFactory) {

         var playerList = PlayersFactory.getPlayers();

         $scope.editablePlayerList = [];
         angular.forEach(playerList, function (value, index) {
             this.push({
                 player: value,
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
                 PlayersFactory.modifyPlayer(item.player);
             }

             item.temp = null;
             item.editMode = false;
         };

         $scope.addPlayer = function () {
             var player = PlayersFactory.createPlayer("New Player");

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

             PlayersFactory.deletePlayer(item.player);
         }
     }]);