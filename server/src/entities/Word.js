const { format } = require('date-fns');

class Word {
    constructor(word) {
        this.id = word.id;
        this.name = word.name;
        this.translation = word.translation;
        this.transcription = word.transcription;
        this.rating = word.rating;
        this.lastShow =  format(new Date(word.lastShow), 'dd.MM.yyyy H:mm:ss');
        this.numberShow = word.numberShow;
        this.numberSuccesses = word.numberSuccesses;
        this.numberFailures = word.numberFailures;
        this.createdAt = format(new Date(word.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(word.updatedAt), 'dd.MM.yyyy');
    }
}

class Words {
    constructor(words) {
        this.results = words.map((word) => ({
            ...new Word(word)
        }));
    }
}

module.exports = {
    Word,
    Words
}