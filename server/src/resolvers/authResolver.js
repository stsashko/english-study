const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User} = require("./../entities/User");
const { GraphQLUpload } = require('graphql-upload');
const {uploadFile} = require("../utils/uploadFile");

class AuthQuery {
    getUser = async (parent, args, context) => {
        context.isAuth();
        try {
            const user = await context.prisma.user.findUnique({ where: { id: context.userId } })
            if (!user) {
                throw new Error('No such user found')
            }
            return new User(user);
        } catch (e) {
            return e
        }
    }
}


class AuthMutation {

    signup = async (parent, args, context, info) => {
        try {
            const existEmail =  await context.prisma.user.findUnique({
                where: {
                    email: args.email,
                }
            });

            if(existEmail)
                throw new Error('E-mail already exists');

            const password = await bcrypt.hash(args.password, 10);

            const {url} = await uploadFile(args.image, 'images');

            const user = await context.prisma.user.create({ data: {
                    name: args.name,
                    email: args.email,
                    password,
                    image: url
                }});
            const token = jwt.sign({ userId: user.id }, process.env.TOKEN_KEY);

            return {
                token,
                user: new User(user),
            }
        } catch (e) {
            return e;
        }
    }

    login = async (parent, args, context, info) => {
        try {
            const user = await context.prisma.user.findUnique({ where: { email: args.email } })
            if (!user) {
                throw new Error('No such user found')
            }
            const valid = await bcrypt.compare(args.password, user.password)
            if (!valid) {
                throw new Error('Invalid password')
            }
            const token = jwt.sign({ userId: user.id }, process.env.TOKEN_KEY);

            return {
                token,
                user: new User(user),
            }
        } catch (e) {
            return e
        }
    }
}

const AuthResolver = {
    Upload: GraphQLUpload
}

module.exports = {
    AuthQuery: new AuthQuery(),
    AuthMutation: new AuthMutation(),
    AuthResolver
}