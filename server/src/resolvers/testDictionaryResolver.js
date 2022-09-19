class TestDictionaryResolver {
    TestDictionary = {
        dictionaryGroup(parent, args, context) {
            return context.prisma.testDictionary.findUnique({where: {id: parent.id}}).dictionaryGroup()
        }
    }
}

module.exports = {
    TestDictionaryResolver: new TestDictionaryResolver()
}