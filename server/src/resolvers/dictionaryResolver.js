const {whereFilter, orderByFilter} = require("../utils/filter");
const {Dictionaries, Dictionary} = require("../entities/Dictionary");

const isExist = async (context, id) => {
    const isExist = await context.prisma.dictionary.count({
        where: {
            dictionaryGroupId: parseInt(id),
            userId: context.userId
        }
    });
    return Boolean(isExist);
}

class DictionaryQuery  {
    dictionaries = async (parent, args, context) => {
        context.isAuth();

        const where = {
            ...whereFilter(args.filter),
            userId: context.userId
        };

        const orderBy = orderByFilter(args?.orderBy);

        const skip = args?.skip ? (args.skip * parseInt(args.take)) : undefined;

        try {
            const {results} = new Dictionaries(await context.prisma.dictionary.findMany({
                where,
                skip: skip,
                take: args?.take || undefined,
                orderBy
            }));

            return {
                data:  results,
                count: await context.prisma.dictionary.count({ where })
            };
        } catch (e) {
            return  e;
        }
    }

    getDictionary = async (parent, args, context) => {
        context.isAuth();
        try {
            const dictionary = new Dictionary(await context.prisma.dictionary.findFirst({
                where: {
                    userId: context.userId,
                    id: parseInt(args.id)
                }
            }));
            return dictionary
        } catch (e) {
            return e;
        }
    }
}

class DictionaryMutation {
    createDictionary = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if(args.wordsId.length <= 0)
                throw new Error('Not selected IDs');

            const dictionaryGroup = await context.prisma.dictionaryGroup.create({
                data: {
                    name: args.nameDictionary,
                    userId: context.userId,
                },
            });

            const dictionaries = await context.prisma.dictionary.createMany({
                data: args.wordsId.map(i => ({
                    wordId: i,
                    userId: context.userId,
                    dictionaryGroupId: dictionaryGroup.id
                }))
            });

            return dictionaries;
        } catch (e) {
            return e;
        }

    }

    addDictionary = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const dictionary = await context.prisma.dictionary.create({
                data: {
                    wordId: args.input.wordId,
                    userId: context.userId,
                    dictionaryGroupId: args.input.dictionaryGroupId,
                },
            })
            return new Dictionary(dictionary);
        } catch (e) {
            return e;
        }
    }

    updDictionary = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a iD does not exist');

            const dictionary = await context.prisma.dictionary.update({
                where: {
                    id: parseInt(args.id),
                },
                data: {
                    wordId: args.input.wordId,
                    dictionaryGroupId: args.input.dictionaryGroupId,
                    updatedAt: new Date().toISOString(),
                },
            })
            return new Dictionary(dictionary);
        } catch (e) {

            console.log(e);

            return e;
        }
    }

    delDictionary = async (parent, args, context, info) => {
        context.isAuth();

        try {
            if (!await isExist(context, args.dictionaryGroupId))
                throw new Error('Such a iD does not exist');

            if(args.ids.length <= 0)
                throw new Error('Not selected IDs');

            const dictionaries = await context.prisma.dictionary.deleteMany({
                where: {
                    userId: context.userId,
                    id: { in: args.ids }
                }
            });

            return dictionaries;
        } catch (e) {
            return e;
        }
    }
}

const DictionaryResolver = {
    Dictionary: {
        word(parent, args, context) {
            return context.prisma.dictionary.findUnique({where: {id: parent.id}}).word()
        },
        dictionaryGroup(parent, args, context) {
            return context.prisma.dictionary.findUnique({where: {id: parent.id}}).dictionaryGroup()
        }
    }
}

module.exports = {
    DictionaryQuery: new DictionaryQuery(),
    DictionaryMutation: new DictionaryMutation(),
    DictionaryResolver
}