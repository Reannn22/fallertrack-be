const admin = require('../config/firebase');
const db = admin.firestore();

const logError = (error) => {
  console.error(error);
};

module.exports = {
  logError
};
