const filterJsonData = require("../exports/search");
const { makeApiCall } = require("../queues/dispatch");
const GlobalModel = require("../model/Global")
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

module.exports = {
     worker_restapi_one : async (payload, push_config_type) => {
        console.log(`Processing New API task`);
        try {
            const filePath = './pushConfigState.json';
            const locationIds = payload?.item_payload?.locations;
            let successCount = 0;
            let returnresult // Track the number of successful API calls
    
            if (Array.isArray(locationIds)) {
                for (const locationId of locationIds) {
                    const criteria = { push_config_type: push_config_type, location_id: locationId };
                    const db_result = await filterJsonData(filePath, criteria);
                    if (db_result.length > 0) {
                        let config = db_result[0];
    
                        const result = await makeApiCall(config.push_config_url, config?.method, payload, {}, '', '');
                        returnresult = result
                        if (result && result?.status === 1) {
                            successCount++; // Increment on successful API call
                        }
                        // Assuming the `makeApiCall` function resolves successfully if the API call was successful
                       
                    } else {
                        console.log(`No configuration found for location ID: ${locationId}`);
                    }
                }
    
                if (successCount === locationIds.length) {
                    console.log(`All ${successCount} API tasks completed successfully.`);
                    //update processed_state
                    //update pushed_state
                    //update acknowlegde_state
                    //update and acknowledge birdseye
                    let update_payload = {
                        processed_state:true,
                        pushed:returnresult?.data?.saved,
                        pushed_at:systemDate,
                        acknowledged:returnresult?.data?.ack,
                        acknowledged_at:returnresult?.data?.saved_at,


                    }
                    GlobalModel.Update(update_payload, 'push_main_queue', 'monitor_id', payload.monitor_id)

                } else {
                    console.log(`${successCount} out of ${locationIds.length} API tasks completed successfully.`);
                }
            } else {
                console.error('Location IDs is not an array.');
            }
        } catch (error) {
            console.error('Error making API call:', error);
        }
    },
    
    // Make sure to replace `makeApiCall` and other placeholders with your actual implementation details.
    
}