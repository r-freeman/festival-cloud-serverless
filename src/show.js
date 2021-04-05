const parser = require("lambda-multipart-parser");
const {v4} = require("uuid");
const Show = require("./show.model");
const connectToDatabase = require("./database");

// create show
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {start_time, end_time, performer_id, performer_title, festival_id, festival_title} = parsedEvent;
        const id = v4();

        let show = new Show({id, start_time, end_time, performer_id, performer_title, festival_id, festival_title});

        await show.save();

        if (show) {
            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(show.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {
            const id = event.pathParameters.id;
            let show = await Show.query("id").eq(id).exec();
            show = show.toJSON().shift();

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

        const shows = await Show.scan().exec();

        if (shows) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(shows.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {
            const parsedEvent = await parser.parse(event);
            const {start_time, end_time, performer_id, performer_title, festival_id, festival_title} = parsedEvent;
            let id = event.pathParameters.id;

            let show = await Show.query("id").eq(id).exec();
            show = show.toJSON().shift();

            if (show) {
                show = await Show.update({id}, {
                    start_time,
                    end_time,
                    performer_id,
                    performer_title,
                    festival_id,
                    festival_title
                });

                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(show.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {
            let id = event.pathParameters.id;
            let show = await Show.query("id").eq(id).exec();

            if (show) {
                await Show.delete({"id": id});

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