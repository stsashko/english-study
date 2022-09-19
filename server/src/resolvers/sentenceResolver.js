const {whereFilter, orderByFilter} = require("../utils/filter");
const {Sentences, Sentence} = require("../entities/Sentence");

const isExist = async (context, id) => {
    const isExist = await context.prisma.sentence.count({
        where: {
            id: parseInt(id),
            word: {
                userId: context.userId
            }
        }
    });
    return Boolean(isExist);
}

class SentenceQuery  {
    sentences = async (parent, args, context) => {
        context.isAuth();
        try {
            const where = {
                ...whereFilter(args.filter),
                word: {
                    userId: context.userId,
                    name: {
                        contains: args.filter?.searchWord
                    }
                }
            };

            const orderBy = orderByFilter(args?.orderBy);
            const skip = args?.skip ? (args.skip * parseInt(args.take)) : undefined;
            const {results} = new Sentences(await context.prisma.sentence.findMany({
                where,
                skip: skip,
                take: args?.take || undefined,
                orderBy
            }));

            return {
                data:  results,
                count: await context.prisma.sentence.count({ where })
            }
        } catch (e) {
            return e;
        }
    }
    getSentence = async(parent, args, context) => {
        context.isAuth();
        try {
            const sentence = new Sentence(await context.prisma.sentence.findFirst({
                where: {
                    id: parseInt(args.id),
                    word: {
                        userId: context.userId
                    }
                }
            }));
            return sentence
        } catch (e) {
            return e;
        }
    }
}

class SentenceMutation  {
    updSentence = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a iD does not exist');

            const sentence = await context.prisma.sentence.update({
                where: {
                    id: parseInt(args.id),
                },
                data: {
                    text:           args.input.text,
                    translation:    args.input.translation,
                    updatedAt: new Date().toISOString(),
                },
            })
            return new Sentence(sentence);
        } catch (e) {
            return e;
        }
    }

    delSentence = async (parent, args, context, info) => {
        context.isAuth();
        try {
            if (!await isExist(context, args.id))
                throw new Error('Such a iD does not exist');

            const sentence = await context.prisma.sentence.delete({
                where: {
                    id: args.id,
                },
            })
            return new Sentence(sentence);
        } catch (e) {
            return  e;
        }
    }
}

const SentenceResolver = {
    Sentence: {
        word(parent, args, context) {
            return context.prisma.sentence.findUnique({where: {id: parent.id}}).word()
        }
    }
}

module.exports = {
    SentenceQuery: new SentenceQuery(),
    SentenceMutation: new SentenceMutation(),
    SentenceResolver
}