const dynamoose = require("dynamoose");

const Stage = dynamoose.model("stagesTable",
    new dynamoose.Schema({
        "id": String,
        "title": String,
        "description": String,
        "location": String,
        "festival_id": String,
        "festival_title": String,
        "image_path": String
    }, {timestamps: true}), {"create": false});

module.exports = Stage;


