const parser = require("lambda-multipart-parser");
const {v4} = require("uuid");
const Stage = require("./stage.model");
const connectToDatabase = require("./database");
const uploadImage = require("./upload_image");

// create stage
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {title, description, location, festival_id, festival_title} = parsedEvent;
        const id = v4();

        let stage = new Stage({id, title, description, location, festival_id, festival_title});

        await stage.save();

        if (stage) {
            // only upload images in production
            if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                const image_path = await uploadImage("stage", parsedEvent.files[0]);

                stage = await Stage.update({id}, {image_path});

                return callback(null, {
                    statusCode: 201,
                    body: JSON.stringify(stage.toJSON())
                });
            }

            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(stage.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {
            const id = event.pathParameters.id;
            let stage = await Stage.query("id").eq(id).exec();
            stage = stage.toJSON().shift();

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

        const stages = await Stage.scan().exec();

        if (stages) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(stages.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {
            const parsedEvent = await parser.parse(event);
            const {title, description, location, festival_id, festival_title} = parsedEvent;
            let id = event.pathParameters.id;

            let stage = await Stage.query("id").eq(id).exec();
            stage = stage.toJSON().shift();

            if (stage) {
                stage = await Stage.update({id}, {title, description, location, festival_id, festival_title});

                if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                    const image_path = await uploadImage("stage", parsedEvent.files[0]);
                    stage = await Stage.update({id}, {image_path});

                    return callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(stage.toJSON())
                    });
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

        if (typeof event.pathParameters.id !== 'undefined') {
            let id = event.pathParameters.id;
            let stage = await Stage.query("id").eq(id).exec();

            if (stage) {
                await Stage.delete({"id": id});

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