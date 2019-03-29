class Room {

    constructor() {
        this.users = [];
    }

    addUser(user) {

        this.users.push(user);

        return this.users;

    }

    getUser(id) {
        let user = this.users.filter(u => u.id === id)[0];
        return user;
    }

    getUsers() {
        return this.users;
    }

    deleteUser(id) {

        let userDeleted = this.getUser(id);

        this.users = this.users.filter(u => u.id != id);

        return userDeleted;

    }

    getAgent(){
        return this.users.filter(u => u.systemId === process.env.PURECLOUD_AGENT)[0];
    }

    getClient(){
        return this.users.filter(u => u.systemId !== process.env.PURECLOUD_AGENT)[0];
    }


}


module.exports = {
    Room
}