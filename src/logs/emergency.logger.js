const admin = require('../../config/firebase');
const db = admin.firestore();

const logEmergencySearch = (searchData) => {
  console.log('Emergency search:', searchData);
};

module.exports = { logEmergencySearch };
