const { format } = require('date-fns');

class StatisticChartItem {
    constructor(statistic) {
        this.name = format(new Date(statistic.name), 'dd.MM.yy');
        this.success = statistic.success;
        this.fail = statistic.fail;
    }
}

class StatisticChart {
    constructor(statistics) {
        this.results = statistics.map((statistic) => ({
            ...new StatisticChartItem(statistic)
        }));
    }
}

module.exports = {
    StatisticChartItem,
    StatisticChart
}