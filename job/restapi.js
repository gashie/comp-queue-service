

module.exports = {
    worker_restapi_one: async (payload, push_config_type) => {
        try {
            const tableName = 'push_config';
            const columnsToSelect = []; // Use string values for column names
            const conditions = [
                { column: 'push_config_type', operator: '=', value: push_config_type },
                { column: 'is_default', operator: '=', value: true },

            ];
            let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
            let db_result = results.rows[0]
            // const url = 'https://example.com/api';
            // const method = 'POST';
            // const headers = { 'Content-Type': 'application/json' };
            // const authType = 'Bearer'; // or 'Basic', 'CustomAuth', etc.
            // const authValue = 'your_token'; // or { username: 'your_username', password: 'your_password' } for Basic auth

            const result = await makeApiCall(db_result.push_config_url, db_result?.method, payload, db_result.push_config_header, db_result?.authType, db_result?.push_config_auth_token);
            console.log('API response:', result);
            //check response and update the restapi queue
        } catch (error) {
            console.error('Error making API call:', error.message);
        }
    }
}