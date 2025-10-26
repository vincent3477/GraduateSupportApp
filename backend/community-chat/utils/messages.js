const formatMessage = (username, text) => {
  const timestamp = new Date();
  const options = { hour: 'numeric', minute: '2-digit' };
  const time = timestamp.toLocaleTimeString('en-US', options);
  return {
    username,
    text,
    time: time.toLowerCase(),
  };
};

module.exports = formatMessage;
