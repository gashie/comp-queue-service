async function filterJsonData(filePath, criteria) {
    const fs = require('fs');
    
    /**
     * Asynchronously filters JSON data from a file based on multiple criteria.
     * 
     * @param {string} filePath - The path to the JSON file.
     * @param {Object} criteria - An object containing the fields and values to filter by.
     * @returns {Promise<Array>} - A promise that resolves to an array of objects that match the criteria.
     */
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    const filteredData = jsonData.filter(item =>
      Object.keys(criteria).every(key => item[key] === criteria[key])
    );

    return filteredData;
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    throw error;
  }
}

// Example usage
const filePath = './pushConfigState.json'; // Path to your JSON file
const criteria = { push_config_type: 'rabbitmq', push_config_state: true }; // Example criteria

filterJsonData(filePath, criteria)
  .then(filteredData => console.log(filteredData))
  .catch(error => console.error(error));
