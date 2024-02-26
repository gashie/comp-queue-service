// startupTasks.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { Finder } = require('../model/Global');
const { logAction } = require('../logs/custom');

const pool = new Pool({
    // database configuration
});

async function fetchAndSaveConfig() {
    try {
        // Connect to the database and fetch records
        const tableName = 'push_config';
        const columnsToSelect = []; // Use string values for column names
        const conditions = [
            { column: 'is_default', operator: '=', value: true },

        ];
        let results = await Finder(tableName, columnsToSelect, conditions)
        let db_result = results.rows

        // Define the path for the JSON file
        const filePath = path.join(__dirname, '../pushConfigState.json');

        // Save the fetched records to the JSON file
        fs.writeFileSync(filePath, JSON.stringify(db_result, null, 2));
        console.log('Configuration saved to pushConfigState.json');
        logAction('startup-task', { message: 'Configuration saved to pushConfigState.json' });
    } catch (error) {
        logAction('startup-task-error', { error: 'Failed to fetch and save configuration:', detail: error?.message });
    }
}

module.exports = fetchAndSaveConfig;
