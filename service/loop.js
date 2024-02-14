const { processTask } = require("../job/process");
const { pullQueue } = require("../model/Queue");
const { loadServiceState, saveServiceState } = require('../utils/serviceStateHandler');

module.exports = {
    serviceLoop: async () => {
        while (true) { // Use a condition that ensures we can check for updated state in each iteration
            let serviceState = loadServiceState(); // Reload the latest state at the beginning of each iteration

            if (!serviceState.running || serviceState.shutdown) {
                console.log("Service stopping, no more tasks will be processed.");
                break; // Exit loop if service is stopped or shutdown initiated
            }

            if (!serviceState.running) {
                console.log("Service stopped, exiting loop.");
                break; // Exit loop if service is stopped
            }

            if (serviceState.paused) {
                console.log("Service paused, sleeping for 10 seconds.");
                await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep while paused
                continue;
            }

            console.log("Fetching tasks...");
            const tasks = await pullQueue();
            serviceState.taskCount = tasks.rows.length;
            saveServiceState(serviceState); // Optionally save updated state, though might not be necessary each loop
            
            for (const task of tasks.rows) {
                serviceState = loadServiceState(); // Reload state to check for updates
                if (!serviceState.running || serviceState.shutdown) {
                    console.log("Service stopping, completing current task and exiting.");
                    break; // Finish the current task before stopping
                }
                await processTask(task);
                // Update taskCount and completedTasks accordingly
            }

            console.log("Sleeping for 5 seconds before next cycle.");
            await new Promise(resolve => setTimeout(resolve, 5000)); // Delay between processing cycles
        }
    },
};
