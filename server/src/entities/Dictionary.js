const { format } = require('date-fns');

class Dictionary {
    constructor(dictionary) {
        this.id = dictionary.id;
        this.wordId = dictionary.wordId;
        this.dictionaryGroupId = dictionary.dictionaryGroupId;
        this.createdAt = format(new Date(dictionary.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(dictionary.updatedAt), 'dd.MM.yyyy');
    }
}

class Dictionaries {
    constructor(dictionaries) {
        this.results = dictionaries.map((dictionary) => ({
            ...new Dictionary(dictionary)
        }));
    }
}

module.exports = {
    Dictionary,
    Dictionaries
}