const {whereFilter, orderByFilter} = require("../utils/filter");
const {
    testQuestionStatistic,
    getQuestionsTests,
    getPaginationTest,
    updateWordStatistic,
    updateQuestionGenerated,
    getPaginationTestSentence,
    updateSentenceStatistic
} = require("../services/test_question.service");
const {TestQuestions, TestQuestion} = require("../entities/TestQuestion");
const GraphQLJSON = require("graphql-type-json");
const {GraphQLJSONObject} = GraphQLJSON;

const isExist = async (context, id) => {
    const isExist = await context.prisma.testQuestion.count({
        where: {
            id: parseInt(id),
            userId: context.userId
        }
    });
    return Boolean(isExist);
}

class TestQuestionQuery {
    testQuestions = async (parent, args, context) => {
        context.isAuth();

        const where = {
            ...whereFilter(args.filter), userId: context.userId
        }
        const orderBy = orderByFilter(args?.orderBy);

        try {
            const {results} = new TestQuestions(await context.prisma.testQuestion.findMany({
                where, skip: args?.skip || undefined, take: args?.take || undefined, orderBy
            }));

            return {
                data: results,
                count: await context.prisma.testQuestion.count({where})
            }
        } catch (e) {
            return e;
        }
    }
    getTestQuestion = async (parent, args, context) => {
        context.isAuth();
        try {
            const testQuestion = new TestQuestion(await context.prisma.testQuestion.findFirst({
                where: {
                    id: parseInt(args.id),
                    userId: context.userId
                }
            }));
            return testQuestion
        } catch (e) {
            return e;
        }
    }
    getRandomQuestionWord = async (parent, args, context) => {
        context.isAuth();


        // console.log(new Date())
        // console.log(new Date().toString())
        // console.log(new Date())

        try {
            const question = await context.prisma.$queryRawUnsafe(`
                SELECT q.id            as questionId,
                       q.wordId,
                       q.sentenceId,
                       w.name          as wordName,
                       w.translation   as wordTranslation,
                       w.transcription as wordTranscription,
                       q.testTypeId
                FROM TestQuestion as q
                         lEFT JOIN TestType as tt ON tt.id = q.testTypeId
                         lEFT JOIN Word as w ON w.id = q.wordId
                         lEFT JOIN Test as t ON t.id = q.testId
                WHERE q.testId = ${parseInt(args.testId)}
                  AND q.completed = 0
                  AND q.userId = ${context.userId}
                  AND tt.type = '${args.lang}:word'
                ORDER BY q.id asc LIMIT 1;
            `);

            const testType = await context.prisma.testType.findFirst({
                where: {
                    testId: args.testId,
                    type: `${args.lang}:word`
                },
            });

            const questionStatistic = await testQuestionStatistic(context, {
                testId: args.testId,
                testTypeId: testType.id
            });

            if (questionStatistic.totalQuestions && questionStatistic.totalQuestions == questionStatistic.totalResponses) {
                return {
                    testIsOver: true,
                    totalQuestions: questionStatistic['totalQuestions'],
                    totalSuccesses: questionStatistic['totalSuccesses'],
                    totalFailures: questionStatistic['totalFailures'],
                    totalResponses: questionStatistic['totalResponses'],
                };
            } else {
                if (!question.length)
                    throw new Error('The test questions have ended');

                let englishWord = args.lang === 'ua' ? false : true;

                let currentQuestions = await getQuestionsTests(context, question, englishWord, args);

                const pagination = await getPaginationTest(context, {
                    ...args,
                    testTypeId: question[0]['testTypeId']
                }, questionStatistic['totalQuestions']);

                return {
                    questionId: question[0]['questionId'],
                    word: englishWord ? question[0]['wordTranslation'] : question[0]['wordName'],
                    transcription: englishWord ? '' : question[0]['wordTranscription'],
                    totalQuestions: questionStatistic['totalQuestions'],
                    totalSuccesses: questionStatistic['totalSuccesses'],
                    totalFailures: questionStatistic['totalFailures'],
                    totalResponses: questionStatistic['totalResponses'],
                    currentQuestions,
                    pagination,
                    testIsOver: false
                };

            }
        } catch (e) {
            return e;
        }
    }

    getRandomQuestionSentence = async (parent, args, context) => {
        context.isAuth();
        try {
            const question = await context.prisma.$queryRawUnsafe(`
                SELECT q.id as questionId,
                       q.wordId,
                       s.text,
                       s.translation,
                       q.testTypeId
                FROM TestQuestion as q
                         lEFT JOIN TestType as tt ON tt.id = q.testTypeId
                         lEFT JOIN Sentence as s ON s.id = q.sentenceId
                WHERE q.testId = ${parseInt(args.testId)}
                  AND q.completed = 0
                  AND q.userId = ${context.userId}
                  AND tt.type = '${args.lang}:sentence'
                ORDER BY q.id asc LIMIT 1;
            `);

            const testType = await context.prisma.testType.findFirst({
                where: {
                    testId: args.testId,
                    type: `${args.lang}:sentence`
                },
            });

            const questionStatistic = await testQuestionStatistic(context, {
                testId: args.testId,
                testTypeId: testType.id
            });

            if (questionStatistic.totalQuestions && questionStatistic.totalQuestions == questionStatistic.totalResponses) {
                return {
                    testIsOver: true,
                    totalQuestions: questionStatistic['totalQuestions'],
                    totalSuccesses: questionStatistic['totalSuccesses'],
                    totalFailures: questionStatistic['totalFailures'],
                    totalResponses: questionStatistic['totalResponses'],
                };
            } else {
                if (!question.length)
                    throw new Error('The test questions have ended');

                let englishWord = args.lang === 'ua' ? false : true;

                const pagination = await getPaginationTestSentence(context, {
                    ...args,
                    testTypeId: question[0]['testTypeId']
                }, questionStatistic['totalQuestions']);

                return {
                    questionId: question[0]['questionId'],
                    sentence: englishWord ? question[0]['text'] : question[0]['translation'],
                    answer: englishWord ? question[0]['translation'] : question[0]['text'],
                    totalQuestions: questionStatistic['totalQuestions'],
                    totalSuccesses: questionStatistic['totalSuccesses'],
                    totalFailures: questionStatistic['totalFailures'],
                    totalResponses: questionStatistic['totalResponses'],
                    pagination,
                    testIsOver: false
                };
            }
        } catch (e) {
            return e;
        }
    }
}

class TestQuestionMutation {
    addTestQuestion = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const test = await context.prisma.testQuestion.create({
                data: {
                    wordId: parseInt(args.input.wordId),
                    sentenceId: parseInt(args.input.sentenceId),
                    testId: parseInt(args.input.testId),
                    rating: parseInt(args.input.rating || 0),
                    completed: parseInt(args.input.completed || 0),
                    userId: context.userId
                },
            });
            return new TestQuestion(test);
        } catch (e) {
            return e;
        }
    }
    updTestQuestion = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const test = await context.prisma.testQuestion.update({
                where: {
                    id: parseInt(args.id),
                }, data: {
                    wordId: parseInt(args.input.wordId),
                    sentenceId: parseInt(args.input.sentenceId),
                    testId: parseInt(args.input.testId),
                    rating: parseInt(args.input.rating || 0),
                    completed: parseInt(args.input.completed || 0),
                    updatedAt: new Date().toISOString(),
                },
            })
            return new TestQuestion(test);
        } catch (e) {
            return e;
        }
    }
    delTestQuestion = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const test = await context.prisma.testQuestion.delete({
                where: {
                    id: parseInt(args.id),
                },
            });

            return new TestQuestion(test);
        } catch (e) {
            return e;
        }
    }
    sendAnswerWithQuestionWord = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const question = await context.prisma.$queryRawUnsafe(`
                SELECT q.id            as questionId,
                       q.wordId,
                       q.sentenceId,
                       q.testId,
                       w.name          as wordName,
                       w.translation   as wordTranslation,
                       w.transcription as wordTranscription,
                       q.testTypeId
                FROM TestQuestion as q
                         lEFT JOIN Word as w ON w.id = q.wordId
                         lEFT JOIN Test as t ON t.id = q.testId
                WHERE q.id = ${parseInt(args.input.questionId)}
                  AND q.completed = 0
                  AND q.userId = ${context.userId};
            `);

            if (!question.length)
                throw new Error('There is no such question');

            args.testId = args.input.testId;

            const questionUpdate = await context.prisma.testQuestion.update({
                where: {
                    id: parseInt(args.input.questionId),
                }, data: {
                    rating: parseInt(args.input.wordId) === question[0].wordId ? 1 : 0,
                    completed: 1,
                    updatedAt: new Date().toISOString(),
                },
            });

            await updateWordStatistic(context, question, args);
            await updateQuestionGenerated(context, args);

            const questionStatistic = await testQuestionStatistic(context, {
                testId: parseInt(args.input.testId),
                testTypeId: question[0]['testTypeId']
            });

            if (questionStatistic['totalQuestions'] == questionStatistic['totalResponses']) {
                await context.prisma.test.update({
                    where: {
                        id: parseInt(args.input.testId),
                    }, data: {
                        rating: Math.ceil(questionStatistic['totalSuccesses'] * 100 / questionStatistic['totalResponses']),
                        // completed: 1,
                        updatedAt: new Date().toISOString(),
                    },
                });

                await context.prisma.testType.updateMany({
                    where: {
                        id: question[0]['testTypeId'],
                        testId: parseInt(args.input.testId),
                    }, data: {
                        rating: Math.ceil(questionStatistic['totalSuccesses'] * 100 / questionStatistic['totalResponses']),
                        completed: 1,
                        updatedAt: new Date().toISOString(),
                    },
                });
            }

            let englishWord = args.input.lang === 'ua' ? false : true;

            const currentQuestions = await getQuestionsTests(context, question, englishWord, args, true);
            const pagination = await getPaginationTest(context, {
                ...args,
                testTypeId: question[0]['testTypeId']
            }, questionStatistic['totalQuestions']);

            return {
                questionId: questionUpdate.id,
                wordId: question[0].wordId,
                rating: Boolean(questionUpdate.rating),
                totalQuestions: questionStatistic['totalQuestions'],
                totalSuccesses: questionStatistic['totalSuccesses'],
                totalFailures: questionStatistic['totalFailures'],
                totalResponses: questionStatistic['totalResponses'],
                success: parseInt(args.input.wordId) === question[0].wordId,
                currentQuestions,
                pagination
            }
        } catch (e) {
            return e;
        }
    }

    sendAnswerWithQuestionSentence = async (parent, args, context, info) => {
        context.isAuth();

        try {
            const question = await context.prisma.testQuestion.findFirst({
                where: {
                    id: parseInt(args.input.questionId),
                    userId: context.userId,
                    completed: 0
                }
            });

            if (!question?.sentenceId) {
                throw new Error('There is no such question');
            }

            args.testId = args.input.testId;

            const questionUpdate = await context.prisma.testQuestion.update({
                where: {
                    id: parseInt(args.input.questionId),
                }, data: {
                    rating: parseInt(args.input.rating),
                    completed: 1,
                    updatedAt: new Date().toISOString(),
                },
            });

            await updateSentenceStatistic(context, question, args);

            const questionStatistic = await testQuestionStatistic(context, {
                testId: question.testId,
                testTypeId: question['testTypeId']
            });

            if (questionStatistic['totalQuestions'] == questionStatistic['totalResponses']) {
                await context.prisma.test.update({
                    where: {
                        id: question.testId,
                    }, data: {
                        rating: Math.ceil(questionStatistic['totalSuccesses'] * 100 / questionStatistic['totalResponses']),
                        updatedAt: new Date().toISOString(),
                    },
                });

                await context.prisma.testType.updateMany({
                    where: {
                        id: question['testTypeId'],
                        testId: parseInt(args.input.testId),
                    }, data: {
                        rating: Math.ceil(questionStatistic['totalSuccesses'] * 100 / questionStatistic['totalResponses']),
                        completed: 1,
                        updatedAt: new Date().toISOString(),
                    },
                });
            }

            const pagination = await getPaginationTestSentence(context, {
                ...args,
                testTypeId: question['testTypeId']
            }, questionStatistic['totalQuestions']);

            return {
                questionId: questionUpdate.id,
                rating: Boolean(questionUpdate.rating),
                totalQuestions: questionStatistic['totalQuestions'],
                totalSuccesses: questionStatistic['totalSuccesses'],
                totalFailures: questionStatistic['totalFailures'],
                totalResponses: questionStatistic['totalResponses'],
                pagination,
                success: parseInt(args.input.rating)
            }
        } catch (e) {
            return e;
        }
    }
}

const TestQuestionResolver = {
    TestQuestion: {
        test(parent, args, context) {
            return context.prisma.testQuestion.findUnique({where: {id: parent.id}}).test()
        }
    },
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
}

module.exports = {
    TestQuestionQuery: new TestQuestionQuery(),
    TestQuestionMutation: new TestQuestionMutation(),
    TestQuestionResolver
}