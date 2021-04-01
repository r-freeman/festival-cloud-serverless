const parser = require("lambda-multipart-parser");
const Performer = require("./performer.model");
const connectToDatabase = require("./database");
const uploadImage = require("./upload_image");

// create performer
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {title, description, contact_phone, contact_email} = parsedEvent;

        const performer = await Performer.create({
            title,
            description,
            contact_phone,
            contact_email
        });

        if (performer) {
            // only upload images in production
            if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                await uploadImage(performer, parsedEvent.files[0]);
            }

            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(performer)
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

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const performer = await Performer.findById(filter).exec();

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
}

// read all performers
const read = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const performers = await Performer.find().exec();

        if (performers) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(performers)
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

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}

            const parsedEvent = await parser.parse(event);
            const {title, description, contact_phone, contact_email} = parsedEvent;
            const performer = await Performer.findById(filter).exec();

            if (performer) {
                performer.title = title;
                performer.description = description;
                performer.contact_phone = contact_phone;
                performer.contact_email = contact_email;
                await performer.save();

                if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                    await uploadImage(performer, parsedEvent.files[0]);
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

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const performer = await Performer.findById(filter).exec();

            if (performer) {
                performer.delete();

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
}

module.exports = {create, readOne, read, update, deleteOne}