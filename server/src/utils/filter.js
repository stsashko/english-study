const { formatISO, addDays } = require('date-fns');

const whereFilter = (filter = {}) => {
    const filterNew = {};

    if (Object.keys(filter).length > 0) {
        for (let prop in filter) {
            switch (prop) {
                case 'name':
                    filterNew[prop] = {contains: filter[prop]}
                    break;
                case 'text':
                    filterNew[prop] = {contains: filter[prop]}
                    break;
                case 'translation':
                    filterNew[prop] = {contains: filter[prop]}
                    break;
                case 'nameWord':
                    filterNew['word'] = {
                        name: {
                            contains: filter[prop]
                        }
                    }
                    break;
                case 'searchWord':
                    filterNew['word'] = {
                        name: {
                            contains: filter[prop]
                        }
                    }
                    break;
                case 'date':
                    let date = filter[prop].split('-');
                    filterNew['AND'] = [
                        {
                            createdAt: {
                                gte: formatISO(new Date(  date[0] ))
                            }
                        },
                        {
                            createdAt: {
                                lt: formatISO(addDays(new Date(  date[1] ), 1))
                            }
                        }
                    ]
                    break;
                default:
                    filterNew[prop] = filter[prop];
                    break;
            }
        }
    }

    return filterNew;
}

const orderByFilter = (orderBy) => {
    const orderByNew = [{id: "desc"}];

    if (orderBy) {
        delete orderByNew[0];
        for (let prop in orderBy) {
            orderByNew.push({[prop]: orderBy[prop]})
        }
    }

    return orderByNew;
}

module.exports = {
    whereFilter,
    orderByFilter
}