const dynamoose = require("dynamoose");

const Performer = dynamoose.model("performersTable",
    new dynamoose.Schema({
        "id": String,
        "title": String,
        "description": String,
        "contact_phone": String,
        "contact_email": String,
        "image_path": String
    }, {timestamps: true}), {"create": false});

module.exports = Performer;


