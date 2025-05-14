const getCurrentTimestamp = () => new Date().toISOString();

const formatTimestamp = (date) => {
  if (!date) return getCurrentTimestamp();
  return new Date(date).toISOString();
};

module.exports = {
  getCurrentTimestamp,
  formatTimestamp
};
