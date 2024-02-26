const { channel } = require("../exports/serviceState");
const { logAction } = require("../logs/custom");
const { setupRabbitMQ } = require("../queues/dispatch");
const { loadServiceState, saveServiceState } = require('../utils/serviceStateHandler');
// const { worker_rabbit_one } = require("./rabbitmq");
const { worker_restapi_one } = require("./restapi");



module.exports = {
    processTask : async (task) => {
        let serviceState = loadServiceState(); // Load the latest state
        // if (!channel) await setupRabbitMQ();
        // PROCESS QUEUE BASED ON TYPE
        try {
            switch (task?.push_main_queue_push_type) {
                case 'restapi':
                    // Simulate API call processing
                   
                     worker_restapi_one(task,task?.push_main_queue_push_type)
                    break;
                case 'rabbitmq':
                    // Example of publishing a task to RabbitMQ
                    // await channel.sendToQueue('task_queue', Buffer.from(JSON.stringify(task)), { persistent: true });
                    console.log(`Published task ${task.id} to RabbitMQ`);
                    // worker_rabbit_one()
                    break;
                default:
                    console.error('Unknown task type:', task.push_main_queue_push_type);
            }
            // Simulate updating task status in database
            serviceState.completedTasks++;
            saveServiceState(serviceState); // Save updated state
        } catch (error) {
            logAction('error', { error: 'Task processing failed', taskId: task.id, detail: error.message });
        }
    },

}