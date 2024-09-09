const { env } = require("process");
const ADMINS = env.ADMINS ? JSON.parse(env.ADMINS) : [];
const FORBIDDEN_USERNAMES = env.FORBIDDEN_USERNAMES
  ? JSON.parse(env.FORBIDDEN_USERNAMES)
  : [];

module.exports = { ADMINS, FORBIDDEN_USERNAMES };
