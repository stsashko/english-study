const { format } = require('date-fns');

class DictionaryGroup {
    constructor(dictionaryGroup) {
        this.id = dictionaryGroup.id;
        this.name = dictionaryGroup.name;
        this._count = dictionaryGroup._count;
        this.createdAt = format(new Date(dictionaryGroup.createdAt), 'dd.MM.yyyy');
        this.updatedAt = format(new Date(dictionaryGroup.updatedAt), 'dd.MM.yyyy');
    }
}

class DictionaryGroups {
    constructor(dictionaryGroups) {
        this.results = dictionaryGroups.map((dictionaryGroup) => ({
            ...new DictionaryGroup(dictionaryGroup)
        }));
    }
}

module.exports = {
    DictionaryGroup,
    DictionaryGroups
}