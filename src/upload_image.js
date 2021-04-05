const AWS = require("aws-sdk");

// init s3 client
const s3 = new AWS.S3();

const uploadImage = async (entity, file) => {
    const {content, contentType, filename} = file;
    let imageName = Math.floor(Date.now() / 1000);
    let imageData = new Buffer.from(content, 'binary');
    let imageType = contentType;
    let objectKey = `${imageName}-${filename}`;

    let UPLOAD_PATH = 'uploads/'
    if (entity === 'festival') {
        UPLOAD_PATH = `${UPLOAD_PATH}festivals/`;
    } else if (entity === 'performer') {
        UPLOAD_PATH = `${UPLOAD_PATH}performers/`;
    } else if (entity === 'stage') {
        UPLOAD_PATH = `${UPLOAD_PATH}stages/`;
    }

    await s3.putObject({
        Bucket: process.env.BUCKET,
        Key: `${UPLOAD_PATH}${objectKey}`,
        Body: imageData,
        ContentType: imageType
    }).promise();

    return `https://${process.env.BUCKET}.s3.amazonaws.com/${UPLOAD_PATH}${objectKey}`;
};

module.exports = uploadImage;