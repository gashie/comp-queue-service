const asynHandler = require("../middleware/async");
const { sendResponse, CatchHistory } = require("../helper/utilfunc");
const fs = require('fs');
const path = require('path');
const { logFilePath } = require("../exports/serviceState");

exports.SystemLogs = asynHandler(async (req, res, next) => {
    try {
        const logs = fs.existsSync(logFilePath) ? JSON.parse(fs.readFileSync(logFilePath).toString()) : [];
        const { startDate, endDate, ...otherFilters } = req.body;

        const filterLogs = (log) => {
            let matchesDateRange = true;
            let matchesOtherFilters = true;

            // Date range filtering
            if (startDate || endDate) {
                const logDate = new Date(log.timestamp).getTime();
                const startTimestamp = startDate ? new Date(startDate).getTime() : null;
                const endTimestamp = endDate ? new Date(endDate).getTime() + 86400000 : null; // Include the end date fully
                matchesDateRange = (startTimestamp ? logDate >= startTimestamp : true) &&
                    (endTimestamp ? logDate < endTimestamp : true);
            }

            // Dynamic field-based filtering
            matchesOtherFilters = Object.keys(otherFilters).every(key => {
                const filterValue = otherFilters[key].toLowerCase();
                const [field, subfield] = key.split('.'); // Supports nested fields like 'details.message'

                if (subfield) {
                    return log[field] && log[field][subfield] && log[field][subfield].toString().toLowerCase().includes(filterValue);
                } else {
                    return log[field] && log[field].toString().toLowerCase().includes(filterValue);
                }
            });

            return matchesDateRange && matchesOtherFilters;
        };

        // Apply combined filters to logs
        const filteredLogs = logs.filter(filterLogs);
        if (filteredLogs && filteredLogs.length > 0) {

            return sendResponse(res, 1, 200, 'Logs retrieved', filteredLogs)
        }
        return sendResponse(res, 0, 200, 'Failed to retrieve logs', [])

    } catch (error) {
        console.error('Error reading logs:', error);
        return sendResponse(res, 0, 401, 'Failed to retrieve logs')
    }
})

