const { join } = require('path')
const { readdirSync, readFileSync } = require('fs');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const resolvers = require('./resolvers');
const { constraintDirective, constraintDirectiveTypeDefs } = require('graphql-constraint-directive')
const gqlFiles = readdirSync(join(__dirname, './typedefs'));

let typeDefs = '';

gqlFiles.forEach((file) => {
    typeDefs += readFileSync(join(__dirname, './typedefs', file), {
        encoding: 'utf8',
    });
});

let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers
})
schema = constraintDirective()(schema)
module.exports = schema;