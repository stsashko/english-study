const { format } = require('date-fns');

class TestDictionary {
    constructor(testDictionary) {
        this.id = testDictionary.id;
        this.testId = testDictionary.testId;
        this.dictionaryGroupId = testDictionary.dictionaryGroupId;
        this.createdAt = format(new Date(testDictionary.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(testDictionary.updatedAt), 'dd.MM.yyyy');
    }
}

class TestDictionaries {
    constructor(tests) {
        this.results = tests.map((test) => ({
            ...new TestDictionary(test)
        }));
    }
}

module.exports = {
    TestDictionary,
    TestDictionaries
}