const { env } = require("process");
const ADMINS = env.ADMINS ? JSON.parse(env.ADMINS) : [];

module.exports = { ADMINS };
