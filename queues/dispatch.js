const amqp = require('amqplib');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });
const { logAction } = require("../logs/custom");
const { channel } = require('../exports/serviceState');
module.exports = {
    setupRabbitMQ: async () => {
        try {
            const connection = await amqp.connect(process.env.AMQP_URL || 'amqp://localhost');
            channel = await connection.createChannel();
            await channel.assertQueue('task_queue', { durable: true });
        } catch (error) {
            console.error('RabbitMQ Setup Error:', error);
            logAction('error', { error: 'RabbitMQ setup failed', detail: error.message });
        }
    },
    makeApiCall: async (url, method = 'GET', data = null, headers = {}, authType = null, authValue = null) => {
        try {
            const config = {
                method: method.toUpperCase(),
                url,
                headers,
            };

            if (authType && authValue) {
                if (authType.toLowerCase() === 'basic') {
                    config.auth = {
                        username: authValue.username,
                        password: authValue.password,
                    };
                } else if (authType.toLowerCase() === 'bearer') {
                    config.headers['Authorization'] = `Bearer ${authValue}`;
                } else {
                    // Handle other authentication types as needed
                    // Add conditions for other auth types
                }
            }

            if (data) {
                if (headers['Content-Type'] && headers['Content-Type'].toLowerCase() === 'application/json') {
                    config.data = data;
                } else if (data instanceof FormData) {
                    config.data = data;
                    Object.assign(headers, data.getHeaders());
                } else {
                    config.data = JSON.stringify(data);
                    headers['Content-Type'] = 'application/json';
                }
            }

            const response = await axios(config);

            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async setupRabbitMQConnection(amqp_url) {
        const connection = await amqp.connect(amqp_url); // Update with your RabbitMQ server URL
        return connection;
    },

    async createChannel(connection) {
        const channel = await connection.createChannel();
        return channel;
    },

    async assertQueue(channel, queueName) {
        await channel.assertQueue(queueName);
    },

    async sendMessage(channel, queueName, message) {
        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    },

    async consumeMessages(channel, queueName, onMessageCallback) {
        await channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                onMessageCallback(content);
                channel.ack(msg);
            }
        });
    }
}