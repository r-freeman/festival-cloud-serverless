const parser = require("lambda-multipart-parser");
const Stage = require("./stage.model");
const connectToDatabase = require("./database");
const uploadImage = require("./upload_image");


// create stage
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {title, description, location, festival_id, festival_title} = parsedEvent;

        const stage = await Stage.create({
            title,
            description,
            location,
            festival_id,
            festival_title
        });

        if (stage) {
            // only upload images in production
            if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                await uploadImage(stage, parsedEvent.files[0]);
            }

            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(stage)
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

// read stage
const readOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const stage = await Stage.findById(filter).exec();

            if (stage) {
                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(stage)
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

// read all stages
const read = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const stages = await Stage.find().exec();

        if (stages) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(stages)
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

// update stage
const update = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}

            const parsedEvent = await parser.parse(event);
            const {title, description, location, festival_id, festival_title} = parsedEvent;
            const stage = await Stage.findById(filter).exec();

            if (stage) {
                stage.title = title;
                stage.description = description;
                stage.location = location;
                stage.festival_id = festival_id;
                stage.festival_title = festival_title;
                await stage.save();

                if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                    await uploadImage(stage, parsedEvent.files[0]);
                }

                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(stage)
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

// delete stage
const deleteOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const stage = await Stage.findById(filter).exec();

            if (stage) {
                stage.delete();

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