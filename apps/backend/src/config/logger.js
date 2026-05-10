const serialize = (value) => {
  if (!value) return {};
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};

const print = (level, message, context) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...serialize(context),
  };

  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
    return;
  }
  console.log(line);
};

export const logger = {
  info: (message, context) => print('info', message, context),
  warn: (message, context) => print('warn', message, context),
  error: (message, context) => print('error', message, context),
};
