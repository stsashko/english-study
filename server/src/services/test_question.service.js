const {shuffle} = require("../utils/array");
const {Word} = require("../entities/Word");
const {Sentence} = require("../entities/Sentence");

const testQuestionStatistic = async (context, params) => {
    try {
        const questionStatistic = await context.prisma.$queryRawUnsafe(`
            SELECT COUNT(q.id)                                     as totalQuestions,
                   SUM(IF(q.rating = 1 AND q.completed = 1, 1, 0)) as totalSuccesses,
                   SUM(IF(q.rating = 0 AND q.completed = 1, 1, 0)) as totalFailures,
                   SUM(IF(q.completed = 1, 1, 0))                  as totalResponses
            FROM TestQuestion as q
            WHERE q.testId = ${parseInt(params?.testId)} AND q.testTypeId = ${parseInt(params?.testTypeId)};
        `);
        return {
            totalQuestions: parseInt(questionStatistic[0]['totalQuestions']),
            totalSuccesses: questionStatistic[0]['totalSuccesses'],
            totalFailures: questionStatistic[0]['totalFailures'],
            totalResponses: questionStatistic[0]['totalResponses'],
        }
    } catch (e) {
        return e;
    }
}


const getNewQuestionsTests = async (context, question, englishWord, args) => {
    const otherQuestions = await context.prisma.$queryRawUnsafe(`
        SELECT q.id            as questionId,
               q.wordId,
               q.sentenceId,
               w.name          as wordName,
               w.translation   as wordTranslation,
               w.transcription as wordTranscription
        FROM TestQuestion as q
                 lEFT JOIN Word as w ON w.id = q.wordId
        WHERE q.testId = ${parseInt(args.testId)}
          AND q.wordId != ${question[0].wordId}
          AND q.userId = ${context.userId}
          AND q.testTypeId = ${question[0].testTypeId}
        GROUP BY q.wordId
        ORDER BY rand()
            LIMIT 3;
    `);

    let questionsTests = [{
        wordId: question[0]['wordId'],
        sentenceId: question[0]['sentenceId'],
        wordName: englishWord ? question[0]['wordName'] : question[0]['wordTranslation'],
        wordTranscription: question[0]['wordTranscription'],
        completed: false,
        answer: false,
        customerAnswer: false,
    }];

    otherQuestions.forEach((item) => {
        questionsTests.push({
            wordId: item.wordId,
            sentenceId: item.sentenceId,
            wordName: englishWord ? item.wordName : item.wordTranslation,
            wordTranscription: englishWord ? item.wordTranscription : '',
            completed: false,
            answer: false,
            customerAnswer: false,
        });
    })
    questionsTests = shuffle(questionsTests);

    const questionsGenerated = questionsTests.map(item => (
        {
            testId: parseInt(args.testId),
            questionId: question[0]['questionId'],
            wordId: item.wordId,
            sentenceId: item.sentenceId,
            answer: question[0]['wordId'] === item.wordId ? 1 : 0,
            customerAnswer: 0,
            completed: 0,
            testTypeId: question[0]['testTypeId'],
        }
    ));

    await context.prisma.testQuestionGenerated.createMany({
        data: questionsGenerated,
    })

    return questionsTests;
}


const getQuestionsTests = async (context, question, englishWord, args, onlyUpdate = false) => {
    const isExistQuestionGenerated = await context.prisma.testQuestionGenerated.count({
        where: {
            testId: parseInt(args.testId),
            testTypeId: question[0]['testTypeId'],
            questionId: question[0]['questionId'],
            completed: 0
        }
    });

    let questionsTests = [];
    if(Boolean(isExistQuestionGenerated) || onlyUpdate) {

        questionsTests = await context.prisma.testQuestionGenerated.findMany({
            select: {
                wordId: true,
                sentenceId: true,
                answer: true,
                customerAnswer: true,
                completed: true,
                word: {
                    select: {
                        name: true,
                        translation: true,
                        transcription: true
                    },
                },
            },
            where: {
                testId: parseInt(args.testId),
                questionId: question[0]['questionId'],
                testTypeId: question[0]['testTypeId'],
            }
        });

        questionsTests = questionsTests.map(item => (
            {
                wordId: item['wordId'],
                sentenceId: item['sentenceId'],
                wordName: englishWord ? item.word.name : item.word.translation,
                wordTranscription: englishWord ? item.word.transcription : '',
                completed: item['completed'],
                answer: Boolean(item['completed']) ? Boolean(item['answer']) : false,
                customerAnswer: Boolean(item['completed']) ? Boolean(item['customerAnswer']) : false,
            }
        ));
    } else {
        questionsTests = getNewQuestionsTests(context, question, englishWord, args);
    }

    return questionsTests;
}


const getQuestionGeneratedHistory = async (context, englishWord, args) => {

    let questionsTests = await context.prisma.testQuestionGenerated.findMany({
        select: {
            id: true,
            questionId: true,
            wordId: true,
            sentenceId: true,
            customerAnswer: true,
            answer: true,
            completed: true,
            word: {
                select: {
                    name: true,
                    translation: true,
                    transcription: true
                },
            },
        },
        where: {
            testId: parseInt(args.testId),
            completed: 1
        }
    });

    let resultObj = {};

    questionsTests.forEach((item) => {
        if (!resultObj[item['questionId']]) {
            resultObj[item['questionId']] = [];
        }
        resultObj[item['questionId']].push({
            wordId: item['wordId'],
            sentenceId: item['sentenceId'],
            wordName: englishWord ? item.word.name : item.word.translation,
            wordTranscription: item.word.transcription,
            answer: item.answer,
            customerAnswer: item.customerAnswer,
        });
    });

    let i = 1;
    for (let prop in resultObj) {
        resultObj[i] = resultObj[prop];
        delete resultObj[prop];
        i++;
    }

    return resultObj;
}


const getPaginationTest = async (context, args, totalQuestions = 0) => {

    let questionsTests = await context.prisma.testQuestionGenerated.findMany({
        select: {
            questionId: true,
            customerAnswer: true,
            answer: true,
            completed: true,
        },
        orderBy: {
            questionId: 'asc',
        },
        where: {
            testId: parseInt(args.testId),
            testTypeId: parseInt(args.testTypeId),
        }
    });

    let paginationObject = {};

    let i = 0;
    questionsTests.forEach((item) => {
        if (!paginationObject[item['questionId']]) {
            paginationObject[item['questionId']] = [];
            i++;
        }
        paginationObject[item['questionId']].push({
            number:i,
            current: !Boolean(item.completed),
            completed: item.completed,
            success: item.answer === 1 && item.customerAnswer === 1,
        });
    });

    let paginationFull = [];
    for (let prop in paginationObject) {
        paginationFull.push({
            number: paginationObject[prop][0]['number'],
            current: paginationObject[prop][0]['current'],
            completed: Boolean(paginationObject[prop][0]['completed']),
            success: Boolean(paginationObject[prop].filter(item => item.success).length),
        });
    }

    let start = 1, pagination = [];
    while (start <= totalQuestions)
    {
        pagination.push(paginationFull[start - 1] ? paginationFull[start - 1] : {
            number: start,
            current: false,
            completed: false,
            success: false
        });

        start++;
    }

    return pagination;
}




const getPaginationTestSentence = async (context, args, totalQuestions = 0) => {

    let questionsTests = await context.prisma.TestQuestion.findMany({
        select: {
            id: true,
            rating: true,
            completed: true,
        },
        orderBy: {
            id: 'asc',
        },
        where: {
            testId: parseInt(args.testId),
            testTypeId: parseInt(args.testTypeId)
        }
    });

    let paginationObject = {};

    let i = 0;
    let isCompleted = true;
    questionsTests.forEach((item) => {
        if (!paginationObject[item['id']]) {
            paginationObject[item['id']] = [];
            i++;
        }
        paginationObject[item['id']].push({
            number:i,
            current: isCompleted && !Boolean(item.completed),
            completed: item.completed,
            success:  Boolean(item.rating),
        });
        if(isCompleted && !Boolean(item.completed)) {
            isCompleted = false;
        }
    });


    let paginationFull = [];
    for (let prop in paginationObject) {
        paginationFull.push({
            number: paginationObject[prop][0]['number'],
            current: paginationObject[prop][0]['current'],
            completed: Boolean(paginationObject[prop][0]['completed']),
            success: Boolean(paginationObject[prop].filter(item => item.success).length),
        });
    }

    let start = 1, pagination = [];
    while (start <= totalQuestions)
    {
        pagination.push(paginationFull[start - 1] ? paginationFull[start - 1] : {
            number: start,
            current: false,
            completed: false,
            success: false
        });

        start++;
    }

    return pagination;
}


function toIsoString(date) {
    let tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            return (num < 10 ? '0' : '') + num;
        };

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}





const updateWordStatistic = async (context, question, args) => {
    const word = new Word(await context.prisma.word.findFirst({
        where: {
            id: question[0].wordId,
            userId: context.userId
        }
    }));
    word.numberShow++;
    if(parseInt(args.input.wordId) === question[0].wordId)
        word.numberSuccesses++;
    else
        word.numberFailures++;

    await context.prisma.word.update({
        where: {
            id: question[0].wordId,
        }, data: {
            lastShow: new Date().toISOString(),
            numberShow: {
                increment: 1
            },
            numberSuccesses:  {
                increment: parseInt(args.input.wordId) === question[0].wordId ? 1 : 0
            },
            numberFailures: {
                increment: parseInt(args.input.wordId) === question[0].wordId ? 0 : 1
            },
            rating: Math.ceil(word.numberSuccesses * 100 / word.numberShow),
        },
    })

    await context.prisma.testStatistic.create({
        data: {
            wordId: question[0].wordId,
            sentenceId: null,
            rating: parseInt(args.input.wordId) === question[0].wordId ? 1 : 0,
            userId: context.userId,
            createdAt: new Date().toISOString()
        },
    });
}


const updateSentenceStatistic = async (context, question, args) => {
    const sentence = new Sentence(await context.prisma.sentence.findFirst({
        where: {
            id: question.sentenceId,
            word: {
                userId: context.userId
            }
        }
    }));
    sentence.numberShow++;
    if (args.input.rating)
        sentence.numberSuccesses++;
    else
        sentence.numberFailures++;

    await context.prisma.sentence.update({
        where: {
            id: question.sentenceId,
        }, data: {
            lastShow: new Date().toISOString(),
            numberShow: {
                increment: 1
            },
            numberSuccesses: {
                increment: args.input.rating ? 1 : 0
            },
            numberFailures: {
                increment: args.input.rating ? 0 : 1
            },
            rating: Math.ceil(sentence.numberSuccesses * 100 / sentence.numberShow),
        },
    });

    await context.prisma.testStatistic.create({
        data: {
            wordId: null,
            sentenceId: question.sentenceId,
            rating: args.input.rating ? 1 : 0,
            userId: context.userId,
            createdAt: new Date().toISOString()
        },
    });
}



const updateQuestionGenerated = async (context, args) => {
    await context.prisma.testQuestionGenerated.updateMany({
        where: {
            testId: args.input.testId,
            questionId: args.input.questionId
        },
        data: {
            completed: 1,
        },
    });

    await context.prisma.testQuestionGenerated.updateMany({
        where: {
            testId: args.input.testId,
            questionId: args.input.questionId,
            wordId: args.input.wordId
        },
        data: { customerAnswer: 1 },
    })
}



module.exports = {
    testQuestionStatistic,
    getQuestionsTests,
    getNewQuestionsTests,
    getQuestionGeneratedHistory,
    getPaginationTest,
    updateWordStatistic,
    updateQuestionGenerated,
    getPaginationTestSentence,
    updateSentenceStatistic
}