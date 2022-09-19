const {UserQuery, UserMutation, UserResolver} = require('./userResolver');
const {WordQuery, WordMutation, WordResolver} = require('./wordResolver');
const {AuthMutation, AuthQuery, AuthResolver} = require('./authResolver');
const {SentenceQuery, SentenceMutation, SentenceResolver} = require('./sentenceResolver');
const {DictionaryGroupQuery, DictionaryGroupMutation} = require('./dictionaryGroupResolver');
const {DictionaryQuery, DictionaryMutation, DictionaryResolver} = require('./dictionaryResolver');
const {TestQuery, TestMutation, TestResolver} = require('./testResolver');
const {TestQuestionQuery, TestQuestionMutation, TestQuestionResolver} = require('./testQuestionResolver');
const {ProfileMutation} = require('./profileResolver');
const {TestDictionaryResolver} = require('./testDictionaryResolver');
const {StatisticQuery} = require('./statisticResolver');

const resolvers = {
    Query: {
        ...UserQuery,
        ...WordQuery,
        ...SentenceQuery,
        ...DictionaryGroupQuery,
        ...DictionaryQuery,
        ...TestQuery,
        ...TestQuestionQuery,
        ...AuthQuery,
        ...StatisticQuery
    },
    Mutation: {
        ...UserMutation,
        ...WordMutation,
        ...AuthMutation,
        ...SentenceMutation,
        ...DictionaryGroupMutation,
        ...DictionaryMutation,
        ...TestMutation,
        ...TestQuestionMutation,
        ...ProfileMutation
    },
    ...UserResolver,
    ...WordResolver,
    ...SentenceResolver,
    ...TestQuestionResolver,
    ...AuthResolver,
    ...DictionaryResolver,
    ...TestResolver,
    ...TestDictionaryResolver
};

module.exports = resolvers;