const dynamoose = require("dynamoose");

let isConnected;

module.exports = connectToDatabase = () => {
    return new Promise((resolve) => {
        if (isConnected) {
            console.log('Using existing connection');
            return resolve();
        }

        console.log('Connecting to database');
        let dynamoDb;
        if (!process.env.IS_OFFLINE) {
            dynamoDb = new dynamoose.aws.sdk.DynamoDB({
                "region": "us-east-1"
            })
            dynamoose.aws.ddb.set(dynamoDb);
        } else {
            dynamoose.aws.ddb.local();
        }

        isConnected = dynamoose.aws.ddb();
        resolve();
    });
};