const sendError = (res, statusCode, message) => {
  console.error('Error details:', message);
  res.status(statusCode).json({
    error: message,
    time: new Date().toISOString()
  });
};

const sendSuccess = (res, data) => {
  res.json({
    ...data,
    time: new Date().toISOString()
  });
};

const sendNotFound = (res, message = 'Not found') => {
  sendError(res, 404, message);
};

const sendBadRequest = (res, message) => {
  sendError(res, 400, message);
};

module.exports = {
  sendError,
  sendSuccess,
  sendNotFound,
  sendBadRequest
};
