const parser = require("lambda-multipart-parser");
const {v4} = require("uuid");
const Festival = require("./festival.model");
const connectToDatabase = require("./database");
const uploadImage = require("./upload_image");

// create festival
const create = async (event, context, callback) => {
    try {
        await connectToDatabase();

        const parsedEvent = await parser.parse(event);
        const {title, description, city, start_date, end_date} = parsedEvent;
        const id = v4();

        let festival = new Festival({
            id, title, description, city, start_date, end_date
        });

        await festival.save();

        if (festival) {
            // only upload images in production
            if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                const image_path = await uploadImage("festival", parsedEvent.files[0]);
                festival = await Festival.update({id}, {image_path});

                return callback(null, {
                    statusCode: 201,
                    body: JSON.stringify(festival.toJSON())
                });
            }

            return callback(null, {
                statusCode: 201,
                body: JSON.stringify(festival.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {
            const id = event.pathParameters.id;
            let festival = await Festival.query("id").eq(id).exec();
            festival = festival.toJSON().shift();

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

        const festivals = await Festival.scan().exec();

        if (festivals) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(festivals.toJSON())
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

        if (typeof event.pathParameters.id !== 'undefined') {

            const parsedEvent = await parser.parse(event);
            const {title, description, city, start_date, end_date} = parsedEvent;
            let id = event.pathParameters.id;

            let festival = await Festival.query("id").eq(id).exec();
            festival = festival.toJSON().shift();

            if (festival) {
                festival = await Festival.update({id}, {title, description, city, start_date, end_date});

                if (!process.env.IS_OFFLINE && parsedEvent.files[0]) {
                    const image_path = await uploadImage("festival", parsedEvent.files[0]);
                    festival = await Festival.update({id}, {image_path});

                    return callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(festival.toJSON())
                    });
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

        if (typeof event.pathParameters.id !== 'undefined') {
            let id = event.pathParameters.id;
            let festival = await Festival.query("id").eq(id).exec();

            if (festival) {
                await Festival.delete({"id": id});

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