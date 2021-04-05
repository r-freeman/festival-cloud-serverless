"use strict";

const middy = require("@middy/core");
const cors = require('@middy/http-cors');
const {create, readOne, read, update, deleteOne} = require("./stage");

const stages = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (event.httpMethod === 'POST') {
        return create(event, context, callback);
    } else if (event.httpMethod === 'GET') {
        if (event.pathParameters === null) {
            return read(event, context, callback);
        }
        return readOne(event, context, callback);
    } else if (event.httpMethod === 'PUT') {
        return update(event, context, callback);
    } else if (event.httpMethod === 'DELETE') {
        return deleteOne(event, context, callback);
    }
};

const handler = middy(stages).use(cors());

module.exports = {handler};