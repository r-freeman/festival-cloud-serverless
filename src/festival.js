const parser = require("lambda-multipart-parser");
const Festival = require("./festival.model");
const connectToDatabase = require("./database");
const uploadImage = require("./upload_image");

// create festival
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {title, description, city, start_date, end_date} = parsedEvent;

        const festival = await Festival.create({
            title,
            description,
            city,
            start_date,
            end_date
        });

        if (festival) {
            // only upload images in production
            if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                await uploadImage(festival, parsedEvent.files[0]);
            }

            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(festival)
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

// read festival
const readOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const festival = await Festival.findById(filter).exec();

            if (festival) {
                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(festival)
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

// read all festivals
const read = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const festivals = await Festival.find().exec();

        if (festivals) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(festivals)
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

// update festival
const update = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}

            const parsedEvent = await parser.parse(event);
            const {title, description, city, start_date, end_date} = parsedEvent;
            const festival = await Festival.findById(filter).exec();

            if (festival) {
                festival.title = title;
                festival.description = description;
                festival.city = city;
                festival.start_date = start_date;
                festival.end_date = end_date;
                await festival.save();

                if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                    await uploadImage(festival, parsedEvent.files[0]);
                }

                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(festival)
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

// delete festival
const deleteOne = async (event, context, callback) => {
    try {
        await connectToDatabase();

        if (typeof event.pathParameters.id !== 'undefined' && event.pathParameters.id.length === 24) {
            let filter = {_id: event.pathParameters.id}
            const festival = await Festival.findById(filter).exec();

            if (festival) {
                festival.delete();

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