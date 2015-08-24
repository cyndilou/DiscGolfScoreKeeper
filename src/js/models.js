function Player (properties) {
    this.id = properties.id || createUniqueId();
    this.name = properties.name || '';
    
    this.toListItem = function () {
        return { id: this.id, name: this.name }
    }
}

function Course (properties) {
    this.id = properties.id || createUniqueId();
    this.name = properties.name || name;
    this.holeCount = properties.holeCount || 9;
    this.holes = properties.holes || {};
    
    this.toListItem = function () {
        return { id: this.id, name: this.name, holeCount: this.holeCount};
    }
}

function Game (properties) {
    this.id = properties.id || createUniqueId();
    this.date = properties.date || new Date();
    this.courseId = properties.courseId || '';
    this.playerIds = properties.playerIds || [];
    this.holeScores = properties.holeScores || {};
    
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

