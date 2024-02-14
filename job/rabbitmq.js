const rabbitmqHandler = require('.');
const { setupRabbitMQConnection, createChannel, assertQueue, sendMessage } = require('../queues/dispatch');

module.exports = {
    worker_rabbit_one: async (messageToSend,queueName,push_config_type) => {
        try {
            const tableName = 'push_config';
            const columnsToSelect = []; // Use string values for column names
            const conditions = [
                { column: 'push_config_type', operator: '=', value: push_config_type },
                { column: 'is_default', operator: '=', value: true },

            ];
            let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
            let db_result = results.rows[0]
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