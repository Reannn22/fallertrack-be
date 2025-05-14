const admin = require('../config/firebase');
const db = admin.firestore();

const createTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

const saveToCollections = async (collections, docId, data) => {
  const promises = collections.map(collection => 
    db.collection(collection).doc(docId).set(data)
  );
  return Promise.all(promises);
};

module.exports = {
  db,
  createTimestamp,
  saveToCollections
};
