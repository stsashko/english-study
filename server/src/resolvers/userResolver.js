const {whereFilter, orderByFilter} = require("../utils/filter");
const bcrypt = require('bcrypt');
const {Words} = require("../entities/Word");
const {Users, User} = require("../entities/User");

class UserQuery {
    users = async (parent, args, context) => {
        context.isAuth();

        const where = whereFilter(args.filter);
        const orderBy = orderByFilter(args?.orderBy);

        try {
            const {results} = new Users(await context.prisma.user.findMany({
                where,
                skip: args?.skip || undefined,
                take: args?.take || undefined,
                orderBy
            }));

            return {
                data: results,
                count: await context.prisma.user.count({where})
            }
        } catch (e) {
            return e;
        }
    }
    user = async (parent, args, context) => {
        context.isAuth();
        try {
            const user = new User(await context.prisma.user.findFirst({
                where: {
                    id: parseInt(args.id)
                }
            }));
            return user
        } catch (e) {
            return e;
        }
    }
}

class UserMutation {
    addUser = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const existEmail = await context.prisma.user.findUnique({
                where: {
                    email: args.input.email,
                }
            });

            if (existEmail)
                throw new Error('E-mail already exists');

            const user = await context.prisma.user.create({
                data: {
                    name: args.input.name,
                    email: args.input.email,
                    password: await bcrypt.hash(args.input.password, 10)
                },
            })

            return new User(user);
        } catch (e) {
            return e;
        }
    }
    updUser = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const existEmail = await context.prisma.user.count({
                where: {
                    email: args.input.email,
                    id: {
                        not: parseInt(args.id),
                    }
                }
            });

            if (Boolean(existEmail))
                throw new Error('E-mail already exists');

            let password = args.input.password ? {
                password: await bcrypt.hash(args.input.password, 10)
            } : {};

            const user = await context.prisma.user.update({
                where: {
                    id: parseInt(args.id),
                },
                data: {
                    name: args.input.name,
                    email: args.input.email,
                    updatedAt: new Date().toISOString(),
                    ...password
                },
            });

            return new User(user);
        } catch (e) {
            return e;
        }
    }
    delUser = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const user = await context.prisma.user.delete({
                where: {
                    id: args.id,
                },
            })
            return new User(user);
        } catch (e) {
            return e;
        }
    }
}

const UserResolver = {
    User: {
        async byWords(parent, args, context) {
            try {
                let {results} = new Words(await context.prisma.user.findUnique({where: {id: parent.id}}).byWords());
                return results;
            } catch (e) {
                return e;
            }
        }
    }
}

module.exports = {
    UserQuery: new UserQuery(),
    UserMutation: new UserMutation(),
    UserResolver
}