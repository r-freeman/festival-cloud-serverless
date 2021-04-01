const parser = require("lambda-multipart-parser");
const Show = require("./show.model");
const connectToDatabase = require("./database");

// create show
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {start_time, end_time, performer_id, performer_title, festival_id, festival_title} = parsedEvent;

        const show = await Show.create({
            start_time,
            end_time,
            performer_id,
            performer_title,
            festival_id,
            festival_title
        });

        if (show) {
            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(show)
            });
        }

        return callback(null, {
            statusCode: 422,
            body: JSON.stringify({error: 'Unprocessable Entity'})
        });
    } catch (err) {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify(err)
        });
    }
};

// read show
const readOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const show = await Show.findById(filter).exec();

            if (show) {
                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(show)
                });
            }
        }

        return callback(null, {
            statusCode: 404,
            body: JSON.stringify({error: 'Not Found'})
        });
    } catch (err) {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify(err)
        });
    }
};

// read all shows
const read = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const shows = await Show.find().exec();

        if (shows) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(shows)
            });
        }

        return callback(null, {
            statusCode: 200,
            body: JSON.stringify([])
        });
    } catch (err) {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify(err)
        });
    }
};

// update show
const update = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}

            const parsedEvent = await parser.parse(event);
            const {start_time, end_time, performer_id, performer_title, festival_id, festival_title} = parsedEvent;
            const show = await Show.findById(filter).exec();

            if (show) {
                show.start_time = start_time;
                show.end_time = end_time;
                show.performer_id = performer_id;
                show.performer_title = performer_title;
                show.festival_id = festival_id;
                show.festival_title = festival_title;
                await show.save();

                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(show)
                });
            }
        }

        return callback(null, {
            statusCode: 404,
            body: JSON.stringify({error: 'Not Found'})
        });
    } catch
        (err) {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify(err)
        });
    }
};

// delete show
const deleteOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const show = await Show.findById(filter).exec();

            if (show) {
                show.delete();

                return callback(null, {
                    statusCode: 204,
                    body: JSON.stringify({})
                });
            }
        }

        return callback(null, {
            statusCode: 404,
            body: JSON.stringify({error: 'Not Found'})
        });
    } catch (err) {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify(err)
        });
    }
};

module.exports = {create, readOne, read, update, deleteOne};