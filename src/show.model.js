const dynamoose = require("dynamoose");

const Show = dynamoose.model("showsTable",
    new dynamoose.Schema({
        "id": String,
        "festival_id": String,
        "festival_title": String,
        "performer_id": String,
        "performer_title": String,
        "start_time": String,
        "end_time": String
    }, {timestamps: true}), {"create": false});

module.exports = Show;


