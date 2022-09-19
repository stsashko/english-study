const {whereFilter, orderByFilter} = require('../utils/filter');
const {DictionaryGroups, DictionaryGroup} = require("../entities/DictionaryGroup");

const isExist = async (context, id) => {
    const isExist = await context.prisma.dictionaryGroup.count({
        where: {
            id: parseInt(id),
            userId: context.userId
        }
    });
    return Boolean(isExist);
}

class DictionaryGroupQuery  {
    dictionaryGroups = async (parent, args, context) => {
        context.isAuth();

        const where = {
            ...whereFilter(args.filter),
            userId: context.userId
        };

        const orderBy = orderByFilter(args?.orderBy);

        try {
            const skip = args?.skip ? (args.skip * parseInt(args.take)) : undefined;

            const {results} = new DictionaryGroups(await context.prisma.dictionaryGroup.findMany({
                select: {
                    id: true, name: true, createdAt: true, updatedAt: true,
                    _count: {
                        select: {
                            dictionary: true,
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
                count: await context.prisma.dictionaryGroup.count({where})
            }
        } catch (e) {
            return e;
        }
    }

    getDictionaryGroup = async (parent, args, context) => {
        context.isAuth();
        try {
            const dictionaryGroup = new DictionaryGroup(await context.prisma.dictionaryGroup.findFirst({
                where: {
                    userId: context.userId,
                    id: parseInt(args.id)
                }
            }));
            return dictionaryGroup
        } catch (e) {
            return e;
        }
    }
}

class DictionaryGroupMutation {
    addDictionaryGroup = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const dictionaryGroup = new DictionaryGroup(await context.prisma.dictionaryGroup.create({
                data: {
                    name: args.input.name,
                    userId: context.userId,
                },
            }));

            return dictionaryGroup
        } catch (e) {
            return e;
        }
    }

    updDictionaryGroup = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const dictionaryGroup = new DictionaryGroup(await context.prisma.dictionaryGroup.update({
                where: {
                    id: parseInt(args.id)
                },
                data: {
                    name: args.input.name,
                    updatedAt: new Date().toISOString(),
                },
            }));
            return dictionaryGroup
        } catch (e) {
            return e;
        }
    }

    delDictionaryGroup = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a ID does not exist');

            const dictionaryGroup = new DictionaryGroup(await context.prisma.dictionaryGroup.delete({
                where: {
                    id: args.id
                },
            }));
            return dictionaryGroup
        } catch (e) {
            return e;
        }
    }
}

module.exports = {
    DictionaryGroupQuery : new DictionaryGroupQuery(),
    DictionaryGroupMutation: new DictionaryGroupMutation(),
}