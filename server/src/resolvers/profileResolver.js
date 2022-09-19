const bcrypt = require('bcrypt');
const {User} = require("./../entities/User");
const {uploadFile} = require("../utils/uploadFile");
const path = require("path");
const fs = require('fs');

class ProfileMutation  {
    uploadAvatar = async (parent, { image }, context, info) => {
        context.isAuth();

        try {
            const {url} = await uploadFile(image, 'images');
            const user = await context.prisma.user.findUnique({where: {id: context.userId}})

            if(user.image) {
                const olFilename = path.basename(user.image);
                fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'images', olFilename));
            }

            const userNew = await context.prisma.user.update({
                where: {
                    id: context.userId,
                },
                data: {
                    image: url
                },
            });

            return new User(userNew);
        } catch (e) {
            return e;
        }
    }

    profile = async (parent, args, context, info) => {
        context.isAuth();
        try {
            const existEmail = await context.prisma.user.count({
                where: {
                    email: args.email,
                    id: {
                        not: parseInt(context.userId),
                    }
                }
            });

            if (Boolean(existEmail))
                throw new Error('E-mail already exists');

            let password = args.password ? {
                password: await bcrypt.hash(args.password, 10)
            } : {};

            const user = await context.prisma.user.update({
                where: {
                    id: parseInt(context.userId),
                },
                data: {
                    name: args.name,
                    email: args.email,
                    updatedAt: new Date().toISOString(),
                    ...password
                },
            });

            return new User(user);
        } catch (e) {
            return e;
        }
    }
}

module.exports = {
    ProfileMutation: new ProfileMutation(),
}