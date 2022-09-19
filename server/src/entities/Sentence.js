const { format } = require('date-fns');

class Sentence {
    constructor(sentence) {
        this.id = sentence.id;
        this.text = sentence.text;
        this.translation = sentence.translation;
        this.wordId = sentence.wordId;
        this.rating = sentence.rating;
        this.numberShow = sentence.numberShow;
        this.numberSuccesses = sentence.numberSuccesses;
        this.numberFailures = sentence.numberFailures;
        this.createdAt = format(new Date(sentence.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(sentence.updatedAt), 'dd.MM.yyyy');
    }
}

class Sentences {
    constructor(sentences) {
        this.results = sentences.map((sentence) => ({
            ...new Sentence(sentence)
        }));
    }
}

module.exports = {
    Sentence,
    Sentences
}