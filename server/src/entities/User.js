const { format } = require('date-fns');

class User {
    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.image = user.image;
        this.createdAt = format(new Date(user.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(user.updatedAt), 'dd.MM.yyyy');
        this.rapidApiKey = user.rapidApiKey;
    }
}

class Users {
    constructor(words) {
        this.results = words.map((user) => ({
            ...new User(user)
        }));
    }
}

module.exports = {
    User,
    Users
}