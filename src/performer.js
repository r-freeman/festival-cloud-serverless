const parser = require("lambda-multipart-parser");
const {v4} = require("uuid");
const Performer = require("./performer.model");
const connectToDatabase = require("./database");
const uploadImage = require("./upload_image");

// create performer
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {title, description, contact_email, contact_phone} = parsedEvent;
        const id = v4();

        let performer = new Performer({id, title, description, contact_email, contact_phone});

        await performer.save();

        if (performer) {
            // only upload images in production
            if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                const image_path = await uploadImage("performer", parsedEvent.files[0]);

                performer = await Performer.update({id}, {image_path});

                return callback(null, {
                    statusCode: 201,
                    body: JSON.stringify(performer.toJSON())
                });
            }

            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(performer.toJSON())
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

// read performer
const readOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined') {
            const id = event.pathParameters.id;
            let performer = await Performer.query("id").eq(id).exec();
            performer = performer.toJSON().shift();

            if (performer) {
                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(performer)
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

// read all performers
const read = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const performers = await Performer.scan().exec();

        if (performers) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(performers.toJSON())
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

// update performer
const update = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined') {
            const parsedEvent = await parser.parse(event);
            const {title, description, contact_email, contact_phone} = parsedEvent;
            let id = event.pathParameters.id;

            let performer = await Performer.query("id").eq(id).exec();
            performer = performer.toJSON().shift();

            if (performer) {
                performer = await Performer.update({id}, {title, description, contact_email, contact_phone});

                if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                    const image_path = await uploadImage("performer", parsedEvent.files[0]);
                    performer = await Performer.update({id}, {image_path});

                    return callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(performer.toJSON())
                    });
                }

                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(performer)
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

// delete performer
const deleteOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined') {
            let id = event.pathParameters.id;
            let performer = await Performer.query("id").eq(id).exec();

            if (performer) {
                await Performer.delete({"id": id});

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