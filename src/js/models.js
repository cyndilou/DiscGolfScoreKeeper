function Player (name) {
    this.id = createUniqueId();
    this.name = name;
    
    this.toListItem = function () {
        return { id: this.id, name: this.name }
    }
}

function createUniqueId () {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1,3);
    });
}