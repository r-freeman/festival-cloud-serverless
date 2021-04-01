const AWS = require("aws-sdk");
const Festival = require("./festival.model");
const Performer = require("./performer.model");
const Stage = require("./stage.model");

// init s3 client
const s3 = new AWS.S3();

const uploadImage = async (modelInstance, file) => {
    const {content, contentType, filename} = file;
    let imageName = Math.floor(Date.now() / 1000);
    let imageData = new Buffer.from(content, 'binary');
    let imageType = contentType;
    let objectKey = `${imageName}-${filename}`;

    let UPLOAD_PATH = 'uploads/'
    if (modelInstance instanceof Festival) {
        UPLOAD_PATH = `${UPLOAD_PATH}festivals/`;
    } else if (modelInstance instanceof Performer) {
        UPLOAD_PATH = `${UPLOAD_PATH}performers/`;
    } else if (modelInstance instanceof Stage) {
        UPLOAD_PATH = `${UPLOAD_PATH}stages/`;
    }

    await s3.putObject({
        Bucket: process.env.BUCKET,
        Key: `${UPLOAD_PATH}${objectKey}`,
        Body: imageData,
        ContentType: imageType
    }).promise();

    // modelInstance.object_key = objectKey;
    modelInstance.image_path = `https://${process.env.BUCKET}.s3.amazonaws.com/${UPLOAD_PATH}${objectKey}`;
    await modelInstance.save();
};

module.exports = uploadImage;