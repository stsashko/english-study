const {formatISO, startOfMonth, addDays, addMonths, intervalToDuration} = require('date-fns');
const {StatisticChart} = require("./../entities/Statistic");

class StatisticQuery {
    statisticWord = async (parent, args, context) => {
        context.isAuth();

        try {
            const [fromDate, toDate] = args.date.split('-');

            const intervalDate = intervalToDuration({
                start: new Date(fromDate),
                end: addDays(new Date(toDate), 1)
            });

            const isTooMuch = (intervalDate.years === 1 && intervalDate.months >= 1) || intervalDate.years > 1;

            const words = await context.prisma.$queryRawUnsafe(`
                SELECT ts.createdAt as 'name', SUM(ts.rating = 1) as success,
                       SUM(ts.rating = 0) as fail
                FROM TestStatistic as ts
                WHERE ts.userId = ${context.userId}
                  AND ts.sentenceId IS NULL
                  AND ts.createdAt >= '${formatISO(new Date(fromDate))}'
                  AND ts.createdAt < '${formatISO(isTooMuch ? addMonths(new Date(fromDate), 1) : addDays(new Date(toDate), 1))}'
                GROUP BY DATE_FORMAT(ts.createdAt, '%d.%m.%y')
                ORDER BY ts.createdAt asc LIMIT 31;
            `);

            const {results} = new StatisticChart(words);

            return results;
        } catch (e) {
            return e;
        }
    }

    statisticSentence = async (parent, args, context) => {
        context.isAuth();

        try {
            const [fromDate, toDate] = args.date.split('-');

            const intervalDate = intervalToDuration({
                start: new Date(fromDate),
                end: addDays(new Date(toDate), 1)
            });

            const isTooMuch = (intervalDate.years === 1 && intervalDate.months >= 1) || intervalDate.years > 1;

            const sentences = await context.prisma.$queryRawUnsafe(`
                SELECT ts.createdAt as 'name', SUM(ts.rating = 1) as success,
                       SUM(ts.rating = 0) as fail
                FROM TestStatistic as ts
                WHERE ts.userId = ${context.userId}
                  AND ts.wordId IS NULL
                  AND ts.createdAt >= '${formatISO(new Date(fromDate))}'
                  AND ts.createdAt < '${formatISO(isTooMuch ? addMonths(new Date(fromDate), 1) : addDays(new Date(toDate), 1))}'
                GROUP BY DATE_FORMAT(ts.createdAt, '%d.%m.%y')
                ORDER BY ts.createdAt asc LIMIT 31;
            `);

            const {results} = new StatisticChart(sentences);

            return results;
        } catch (e) {
            return e;
        }
    }

    statisticQuestion = async (parent, args, context) => {
        context.isAuth();
        try {
            const [fromDate, toDate] = args.date.split('-');

            const intervalDate = intervalToDuration({
                start: startOfMonth(new Date(fromDate)),
                end: addMonths(startOfMonth(new Date(toDate)), 1)
            });

            const questions = await context.prisma.$queryRawUnsafe(`
                SELECT DATE_FORMAT(tq.createdAt, '%b %y') as name,
                       tt.type,
                       ROUND(SUM(tq.rating = 1) * 100 / COUNT(*)) as rating
                FROM TestQuestion as tq
                         LEFT JOIN TestType as tt ON tt.id = tq.testTypeId
                WHERE tq.completed = 1
                  AND tq.createdAt >= '${formatISO(startOfMonth(new Date(fromDate)))}'
                  AND tq.createdAt < '${formatISO(intervalDate.years > 2 ? addMonths(startOfMonth(new Date(fromDate)), 12) : addMonths(startOfMonth(new Date(toDate)), 1))}'
                GROUP BY DATE_FORMAT(tq.createdAt, '%m.%y'), testTypeId;
            `);

            const result = [];

            if(questions.length > 0) {
                const objQuestions = {};
                questions.forEach((element) => {
                    let existObj = objQuestions[element.name] ? objQuestions[element.name] : {};
                    objQuestions[element.name] = {
                        ...existObj,
                        name: element.name,
                        [element.type.replace('gb:', 'GB_').replace('ua:', 'UA_')] : element.rating
                    }
                })
                for (let prop in objQuestions) {
                    result.push(objQuestions[prop]);
                }
            }
            return result;
        } catch (e) {
            return e;
        }
    }
}

module.exports = {
    StatisticQuery: new StatisticQuery()
}