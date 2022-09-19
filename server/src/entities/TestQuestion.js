const { format } = require('date-fns');

class TestQuestion {
    constructor(testQuestion) {
        this.id = testQuestion.id;
        this.wordId = testQuestion.wordId;
        this.sentenceId = testQuestion.sentenceId;
        this.rating = testQuestion.rating;
        this.testId = testQuestion.testId;
        this.completed = testQuestion.completed;
        this.createdAt = format(new Date(testQuestion.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(testQuestion.updatedAt), 'dd.MM.yyyy');
    }
}

class TestQuestions {
    constructor(testQuestions) {
        this.results = testQuestions.map((testQuestion) => ({
            ...new TestQuestion(testQuestion)
        }));
    }
}

module.exports = {
    TestQuestion,
    TestQuestions
}