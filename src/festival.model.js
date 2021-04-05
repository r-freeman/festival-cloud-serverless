const dynamoose = require("dynamoose");

const Festival = dynamoose.model("festivalsTable",
    new dynamoose.Schema({
        "id": String,
        "title": String,
        "description": String,
        "city": String,
        "start_date": String,
        "end_date": String,
        "image_path": String
    }, {timestamps: true}), {"create": false});

module.exports = Festival;


