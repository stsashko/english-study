const { whereFilter, orderByFilter } = require("../utils/filter");
const { Word, Words } = require("./../entities/Word");
const { Sentences } = require("../entities/Sentence");

const isExist = async (context, id) => {
  const isExist = await context.prisma.word.count({
    where: {
      id: parseInt(id),
      userId: context.userId,
    },
  });
  return Boolean(isExist);
};

class WordQuery {
  words = async (parent, args, context) => {
    context.isAuth();

    const where = {
      ...whereFilter(args.filter),
      userId: context.userId,
    };

    const orderBy = orderByFilter(args?.orderBy);

    try {
      const skip = args?.skip ? args.skip * parseInt(args.take) : undefined;

      const { results } = new Words(
        await context.prisma.word.findMany({
          where,
          skip: skip,
          take: args?.take || undefined,
          orderBy,
        })
      );

      return {
        data: results,
        count: await context.prisma.word.count({ where }),
      };
    } catch (e) {
      console.log(e);

      return e;
    }
  };
  getWord = async (parent, args, context) => {
    context.isAuth();
    try {
      const word = new Word(
        await context.prisma.word.findFirst({
          where: {
            id: parseInt(args.id),
            userId: context.userId,
          },
        })
      );
      return word;
    } catch (e) {
      return e;
    }
  };
}

class WordMutation {
  addWord = async (parent, args, context, info) => {
    context.isAuth();
    try {
      const word = await context.prisma.word.create({
        data: {
          name: args.input.name,
          translation: args.input.translation,
          transcription: args.input.transcription,
          userId: context.userId,
        },
      });

      await context.prisma.sentence.create({
        data: {
          text: args.input.sentenceText,
          translation: args.input.sentenceTranslation,
          wordId: word.id,
        },
      });

      return new Word(word);
    } catch (e) {
      return e;
    }
  };

  addWordMultiple = async (parent, args, context, info) => {
    context.isAuth();

    try {
      const words = [];

      for (const item of args.input) {
        let word = await context.prisma.word.create({
          data: {
            name: item.name,
            translation: item.translation,
            transcription: item.transcription,
            userId: context.userId,
          },
        });

        await context.prisma.sentence.create({
          data: {
            text: item.sentenceText,
            translation: item.sentenceTranslation,
            wordId: word.id,
          },
        });

        words.push(new Word(word));
      }

      return words;
    } catch (e) {
      return e;
    }
  };

  updWord = async (parent, args, context, info) => {
    context.isAuth();
    try {
      if (!(await isExist(context, args.id)))
        throw new Error("Such a ID does not exist");

      const word = await context.prisma.word.update({
        where: {
          id: parseInt(args.id),
        },
        data: {
          name: args.input.name,
          translation: args.input.translation,
          transcription: args.input.transcription,
          updatedAt: new Date().toISOString(),
        },
      });

      const sentence = await context.prisma.sentence.findFirst({
        where: {
          wordId: word.id,
        },
      });

      if (sentence) {
        await context.prisma.sentence.updateMany({
          where: {
            wordId: word.id,
          },
          data: {
            text: args.input.sentenceText,
            translation: args.input.sentenceTranslation,
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        await context.prisma.sentence.create({
          data: {
            text: args.input.sentenceText,
            translation: args.input.sentenceTranslation,
            wordId: word.id,
          },
        });
      }

      return new Word(word);
    } catch (e) {
      return e;
    }
  };
  delWord = async (parent, args, context, info) => {
    context.isAuth();
    try {
      if (!(await isExist(context, args.id)))
        throw new Error("Such a ID does not exist");

      const word = await context.prisma.word.delete({
        where: {
          id: parseInt(args.id),
        },
      });

      return new Word(word);
    } catch (e) {
      return e;
    }
  };
}

const WordResolver = {
  Word: {
    user(parent, args, context) {
      return context.prisma.word
        .findUnique({ where: { id: parent.id } })
        .user();
    },
    async bySentence(parent, args, context) {
      try {
        let { results } = new Sentences(
          await context.prisma.word
            .findUnique({ where: { id: parent.id } })
            .bySentence()
        );
        return results;
      } catch (e) {
        console.log(e);
        return e;
      }
      return context.prisma.word
        .findUnique({ where: { id: parent.id } })
        .sentence();
    },
  },
};

module.exports = {
  WordQuery: new WordQuery(),
  WordMutation: new WordMutation(),
  WordResolver,
};
