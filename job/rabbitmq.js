const rabbitmqHandler = require('.');
const { setupRabbitMQConnection, createChannel, assertQueue, sendMessage } = require('../queues/dispatch');

module.exports = {
    worker_rabbit_one: async (messageToSend,queueName,push_config_type) => {
        try {
         
            const filePath = '../pushConfigState.json'; // Path to your JSON file
            const criteria = { push_config_type: 'rabbitmq', location_id: payload?.payload.location_id }; // Example criteria
            const db_result = await filterJsonData(filePath, criteria);
            // Setup RabbitMQ connection
            const connection = await setupRabbitMQConnection(db_result?.push_config_url);

            // Create a channel
            const channel = await createChannel(connection);

            // Queue details

            // Assert the queue
            await assertQueue(channel, queueName);

            // Send a message
            await sendMessage(channel, queueName, messageToSend);
              //check response and update the rabbitmq queue


        } catch (error) {
            console.error('Error with RabbitMQ:', error.message);
        }
    }
}