const filterJsonData = require("../exports/search");

// config {
//     push_config_id: 'fef76f3a-60ef-4561-acc4-266dfda1fce1',
//     push_config_name: 'myrestapi',
//     push_config_type: 'restapi',
//     push_config_url: 'https://google.com',
//     push_config_header: '',
//     push_config_username: 'myusername',
//     push_config_password: '31a26904d7005911d7831256aaf48576:3d9ec3f08ababa5304365b85a36cfffb',
//     push_config_auth_token: '53305f47b357543ccd31688b199005f8:c3b58613751abc6f55d68f5982cda36d',
//     push_config_payload: '',
//     push_config_state: false,
//     created_at: '2024-02-08T11:53:01.515Z',
//     updated_at: '2024-02-08T11:53:09.000Z',
//     is_default: true,
//     authType: null,
//     method: null,
//     location_id: 'd372b073-7337-4cfd-96cf-6859715e7c22'
//   }
module.exports = {
    worker_restapi_one: async (payload, push_config_type) => {
        console.log(`Processing New API task`);
        try {


            const filePath = './pushConfigState.json';
            const locationIds = payload?.item_payload?.locations;

            if (Array.isArray(locationIds)) {
                for (const locationId of locationIds) {
                    const criteria = { push_config_type: push_config_type, location_id: locationId };
                    const db_result = await filterJsonData(filePath, criteria);
                    let config = db_result[0];

                    
                  console.log(config.push_config_url, config?.method, 'payload', config.push_config_header, config?.authType, config?.push_config_auth_token);
                    // const result = await makeApiCall(db_result.push_config_url, db_result?.method, payload, db_result.push_config_header, db_result?.authType, db_result?.push_config_auth_token);
                    // console.log('API response:', result);
                    // check response and update the restapi queue
                }
            } else {
                console.error('Location IDs is not an array.');
            }
            // const url = 'https://example.com/api';
            // const method = 'POST';
            // const headers = { 'Content-Type': 'application/json' };
            // const authType = 'Bearer'; // or 'Basic', 'CustomAuth', etc.
            // const authValue = 'your_token'; // or { username: 'your_username', password: 'your_password' } for Basic auth

            // const result = await makeApiCall(db_result.push_config_url, db_result?.method, payload, db_result.push_config_header, db_result?.authType, db_result?.push_config_auth_token);
            // console.log('API response:', result);
            //check response and update the restapi queue
        } catch (error) {
            console.error('Error making API call:', error.message);
        }
    }
}