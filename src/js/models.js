function Player (name) {
    this.id = createUniqueId();
    this.name = name;
    
    this.toListItem = function () {
        return { id: this.id, name: this.name }
    }
}

function Course (name, holeCount) {
    this.id = createUniqueId();
    this.name = name;
    this.holeCount = holeCount || 9;
    this.holes = {};

    this.setHole = function (holeNumber, par, distance) {
        this.holes[holeNumber] = {par: par || 3, distance: distance || 0};
    }
    
    this.toListItem = function () {
        return { id: this.id, name: this.name, holeCount: this.holeCount};
    }
}

function Game (courseId, playerIds) {
    this.id = createUniqueId();
    this.date = new Date();
    this.courseId = courseId;
    this.playerIds = playerIds;
    this.holeScores = {};
    this.scores = {};
    
    this.toListItem = function () {
        return { id: this.id, date: this.date, courseId: this.courseId };
    }

    this.setPlayerScore = function (holeNumber, playerId, score) {
        if (this.holeScores[holeNumber] === undefined) {
            this.holeScores[holeNumber] = {};
        }
        
        this.holeScores[holeNumber][playerId] = score;
    }
}

function createUniqueId () {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1,3);
    });
}

