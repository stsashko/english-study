const { format } = require('date-fns');

class Test {
    constructor(test) {
        this.id = test.id;
        this.dictionaryGroupId = test.dictionaryGroupId;
        this.rating = test.rating;
        this.completed = test.completed;
        this.createdAt = format(new Date(test.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(test.updatedAt), 'dd.MM.yyyy');
        this.TestType = test.TestType;
        this._count = test._count;

    }
}

class Tests {
    constructor(tests) {
        this.results = tests.map((test) => ({
            ...new Test(test)
        }));
    }
}

module.exports = {
    Test,
    Tests
}