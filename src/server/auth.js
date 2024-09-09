const Address = require("./address");

const banStatus = async (req, res, next) => {
  const isBanned = await Address.isBanned(req.session.publicKey);
  if (isBanned) {
    return res.status(422).json({ error: "You are banned!" });
  }

  next();
};

const publicKeyIsRequired = (req, res, next) => {
  if (!req.session.publicKey) {
    return res
      .status(401)
      .send({ error: "Make sure your Solana wallet is connected" });
  }
  next();
};

module.exports = { banStatus, publicKeyIsRequired };
