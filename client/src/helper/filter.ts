export const getFilterData = (data:any):any => {
    const newData = Object.fromEntries(Object.entries(data).map((item:any, index) => {
        if(item[0] === 'date') {
            return [
                'date',
                item[1] ? `${item[1][0]._d.toISOString().replaceAll('-', '.').split('T')[0]}-${item[1][1]._d.toISOString().replaceAll('-', '.').split('T')[0]}`
                 : undefined
            ]
        }
        return item;
    }).filter(([key, value]) => (value !== undefined)));
    return newData;
}