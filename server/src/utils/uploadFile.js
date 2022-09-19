const fs = require('fs');
const path = require('path');
const {randomStr} = require("./string");

const uploadFile = async (file, filePath) => {
    const { createReadStream, filename, mimetype, encoding } = await file;

    if(!["image/jpeg", "image/png", "image/jpg"].includes(mimetype))
        throw new Error('Unsupported file format [jpg, png]');

    const stream = createReadStream();
    const ext = path.extname(filename);

    const newFilename = `${randomStr(20)}${ext}`;

    const pathName = path.join(__dirname, '..', '..', 'public', filePath, newFilename);
    await stream.pipe(fs.createWriteStream(pathName));

    return {
        url: process.env.APP_DEBUG === 'true' ? `http://localhost:${process.env.NODE_SERVER_PORT}/${filePath}/${newFilename}` : `https://${process.env.HOST_CLIENT}/${filePath}/${newFilename}`
    }
}

module.exports = {
    uploadFile
}