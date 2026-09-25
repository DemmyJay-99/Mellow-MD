export const explicitLog = (...args) => {
  if (process.env.EXPLICIT_LOGS === "true") {
    console.log(...args);
  }
};
