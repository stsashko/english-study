const {whereFilter, orderByFilter} = require("../utils/filter");
const {Test, Tests} = require("../entities/Test");
const {TestDictionaries} = require("../entities/TestDictionary");
const {shuffle} = require("../utils/array");

const isExist = async (context, id) => {
    const isExist = await context.prisma.test.count({
        where: {
            id: parseInt(id),
            userId: context.userId
        }
    });
    return Boolean(isExist);
}

class TestQuery {
    tests = async (parent, args, context) => {
        context.isAuth();

        try {
            const where = {
                ...whereFilter(args.filter),
                userId: context.userId
            };
            const orderBy = orderByFilter(args?.orderBy);

            const skip = args?.skip ? (args.skip * parseInt(args.take)) : undefined;

            const {results} = new Tests(await context.prisma.test.findMany({
                select: {
                    id: true, rating: true, completed: true, createdAt: true, updatedAt: true,
                    TestType: {
                        select: {
                            type: true,
                            completed: true
                        },
                    },
                    _count: {
                        select: {
                            TestQuestion: true,
                            TestType: true,
                        },
                    },
                },
                where,
                skip: skip,
                take: args?.take || undefined,
                orderBy
            }));

            return {
                data: results,
                count: await context.prisma.test.count({where})
            }
        } catch (e) {
            return e;
        }
    }
    getTest = async (parent, args, context) => {
        context.isAuth();
        try {
            const test = new Test(await context.prisma.test.findFirst({
                where: {
                    id: parseInt(args.id),
                    userId: context.userId
                }
            }));
            return test
        } catch (e) {
            return e;
        }
    }
}

class TestMutation {
    addTest = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const test = await context.prisma.test.create({
                data: {
                    userId: context.userId,
                    dictionaryGroupId: args.input.dictionaryGroupId,
                    rating: args.input.rating || 0,
                    completed: args.input.completed || 0,
                },
            });

            return new Test(test);
        } catch (e) {
            return e;
        }
    }
    updTest = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const test = await context.prisma.test.update({
                where: {
                    id: parseInt(args.id),
                },
                data: {
                    dictionaryGroupId: args.input.dictionaryGroupId,
                    rating: args.input.rating || 0,
                    completed: args.input.completed || 0,
                    updatedAt: new Date().toISOString(),
                },
            });

            return new Test(test);
        } catch (e) {
            return e;
        }
    }
    delTest = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const test = await context.prisma.test.delete({
                where: {
                    id: args.id,
                },
            });

            return new Test(test);
        } catch (e) {
            return e;
        }
    }
    deleteFullTest = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            await context.prisma.testQuestionGenerated.deleteMany({
                where: {
                    testId: args.id,
                },
            });

            await context.prisma.testQuestion.deleteMany({
                where: {
                    testId: args.id,
                },
            });

            await context.prisma.testDictionary.deleteMany({
                where: {
                    testId: args.id,
                },
            });

            await context.prisma.testType.deleteMany({
                where: {
                    testId: args.id,
                },
            });

            const test = await context.prisma.test.delete({
                where: {
                    id: args.id,
                },
            });

            return new Test(test);
        } catch (e) {
            return e;
        }
    }
    resetFullTest = async(parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const test = await context.prisma.test.update({
                where: {
                    id: args.id,
                },
                data: {
                    rating: 0,
                    completed: 0,
                    updatedAt: new Date().toISOString(),
                },
            });

            await context.prisma.testQuestion.updateMany({
                where: {
                    testId: args.id,
                },
                data: {
                    rating: 0,
                    completed: 0,
                    updatedAt: new Date().toISOString(),
                }
            });

            await context.prisma.testQuestionGenerated.deleteMany({
                where: {
                    testId: args.id,
                },
            });

            await context.prisma.testType.updateMany({
                where: {
                    testId: args.id,
                },
                data: {
                    rating: 0,
                    completed: 0,
                    updatedAt: new Date().toISOString(),
                }
            });

            return new Test(test);
        } catch (e) {
            return e;
        }
    }

    createTest = async (parent, args, context, info) => {
        context.isAuth();

        try {
            if (args.dictionaryGroupIds.length <= 0)
                throw new Error('Not selected IDs');

            const test = await context.prisma.test.create({
                data: {
                    userId: context.userId,
                    rating: 0,
                    completed: 0,
                },
            });

            await context.prisma.testType.createMany({
                data: ['gb:word', 'ua:word', 'gb:sentence', 'ua:sentence'].map(item => ({
                    testId: test.id,
                    type: item,
                    rating: 0,
                    completed: 0
                }))
            });

            await context.prisma.testDictionary.createMany({
                data: args.dictionaryGroupIds.map(i => ({
                    testId: test.id,
                    dictionaryGroupId: parseInt(i),
                }))
            });

            const words = await context.prisma.$queryRawUnsafe(`
                SELECT d.*, s.id as sentenceId
                FROM Dictionary as d
                         lEFT JOIN Sentence as s ON s.wordId = d.wordId
                WHERE d.dictionaryGroupId IN (${args.dictionaryGroupIds.join(',')})
                ORDER BY rand();
            `);

            const testTypes = await context.prisma.testType.findMany({
                where: {
                    testId: test.id
                }
            });

            let testQuestions = [];
            testTypes.forEach((type) => {
                testQuestions = testQuestions.concat(shuffle(words.map(item => ({
                    wordId: item.wordId,
                    sentenceId: item.sentenceId,
                    testId: test.id,
                    rating: 0,
                    completed: 0,
                    userId: context.userId,
                    testTypeId: type.id
                }))));
            })

            await context.prisma.testQuestion.createMany({
                data: testQuestions,
                skipDuplicates: false,
            })

            return new Test(test);
        } catch (e) {
            return e;
        }
    }
}

const TestResolver = {
    Test: {
        async testDictionary(parent, args, context) {
            try {
                let {results} = new TestDictionaries(await context.prisma.test.findUnique({where: {id: parent.id}}).testDictionary());
                return results;
            } catch (e) {
                return e;
            }
        }
    }
}

module.exports = {
    TestQuery: new TestQuery(),
    TestMutation: new TestMutation(),
    TestResolver
}