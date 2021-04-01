const mongoose = require("mongoose");

let isConnected;

module.exports = connectToDatabase = () => {
    if (isConnected) {
        console.log('Using existing connection');
        return Promise.resolve();
    }

    console.log('Connecting to database');
    return mongoose.connect(process.env.MONGO_ATLAS_URI, {
        useNewUrlParser: true,
        bufferCommands: false,
        bufferMaxEntries: 0
    }).then(db => {
        isConnected = db.connections[0].readyState;
    });
};