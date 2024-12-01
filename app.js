const dotenv = require("dotenv");
dotenv.config({
  path: ".env",
});

const path = require("path");
const express = require("express");
const session = require("express-session");
const Joi = require("joi"); // this is for data validation sent from front-end
const { createStorage } = require("./src/server/image-processing");
const Post = require("./src/server/post");
const Comment = require("./src/server/comment");
const Vote = require("./src/server/vote"); // functions ?  variables
const { addressInfo } = require("./src/server/address");
const { createRateLimiter } = require("./src/server/limiter");
const {
  banStatus,
  publicKeyIsRequired,
  onlyAdminAction,
} = require("./src/server/auth");
const { ADMINS } = require("./src/server/configs");
const Address = require("./src/server/address");

const { getTokenBalance } = require("./src/server/web3"); // Import the balance-fetching function
const { getTransactionHistory } = require("./src/server/web3");

// Define storage options for post images and address avatars
const postStorage = createStorage(
  "./public_html/images/posts",
  { width: 64, height: 64 },
  "./public_html/images/posts/thumbnails"
);

const addressStorage = createStorage(
  "./public_html/images/addresses",
  { width: 32, height: 32 },
  "./public_html/images/addresses/thumbnails"
);

const app = express();
app.use(
  session({
    secret: process.env.SESSION_KEY, // Replace with a secure key
    resave: false, // Prevents session from being saved back to the session store if it wasn't modified
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// express.json to decifer json data from incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public_html")));

app.get("/posts/:postId", createRateLimiter(100, 15), async (req, res) => {
  const data = await Post.find(req.params.postId);

  if (!data) {
    // Handle the case where the post is not found
    return res.status(404).send({ error: "Post not found" });
  }
  try {
    const balance = await getTokenBalance(data.post.walletAddress); // Fetch BEBE balance
    data.balance = balance; // Attach the balance to the response
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    data.balance = "Balance unavailable"; // Fallback if an error occurs
  }

  data.ADMINS = ADMINS;
  res.send(data);
});


//updated post route for pagination logic
app.get("/posts", createRateLimiter(100, 15), async (req, res) => {
    try {
        const { page, limit, type, address, query } = req.query;
        const filters = { type, address, query };
        const postsData = await Post.all(filters, { page, limit });

        res.send(postsData);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send({ error: "Failed to fetch posts." });
    }
});


app.post(
  "/post",
  createRateLimiter(100, 15),
  banStatus,
  publicKeyIsRequired,
  postStorage.upload.single("image"),
  postStorage.saveImageAndThumbnail,
  async (req, res) => {
    const schema = Joi.object({
      title: Joi.string().max(124).required(),
      duration: Joi.number().integer().min(1).max(30).required(),
      description: Joi.string().max(10001).required(), // apparently you need to add 1 extra character because it does not match front-end otherwise
      options: Joi.array().max(1025).required(),
      tags: Joi.string().max(124).required(),
      type: Joi.string().max(13).required(),
      votes: Joi.array().max(1025).required(),
      quorum: Joi.number().min(1).max(100).required(),
    });

    const { error } = schema.validate(req.body, () => {});

    // TO-DO:
    // Make sure wallet has at least $MIN_TOKEN_BALANCE_FOR_POST to post

    if (error) {
      res.status(401).send(error.details[0].message);
      return;
    }

    const post = new Post({
      ...req.body,
      ...req.file,
      walletAddress: req.session.publicKey,
    });

    const createdPost = await post.save();

    res.send(createdPost);
  }
);

app.post("/wallet-balance", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    const balance = await getTokenBalance(walletAddress); // Use the existing function to get balance
    res.json({ balance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error.message);
    res.status(500).json({ error: "Failed to fetch wallet balance" });
  }
});


app.post(
  "/vote",
  createRateLimiter(100, 15),
  banStatus,
  publicKeyIsRequired,
  async (req, res) => {
    // Joi Schema = how the incoming input data is validated
    const schema = Joi.object({
      postId: Joi.number().integer().max(23000).precision(0).required(),
      optionIndex: Joi.number().integer().required(),
    });

    const { error } = schema.validate(req.body, () => {});

    if (error) {
      res.status(401).send(error.details[0].message);
      return;
    }

    const vote = new Vote({
      ...req.body,
      walletAddress: req.session.publicKey,
    });
    try {
      const newVotes = await vote.save();
      res.send(newVotes);
    } catch (error) {
      res.status(409).send({ error: error.message });
    }
  }
);


//updated route with admin only permissions
app.delete("/delete-post", async (req, res) => {
  try {
    const { id } = req.body;
    const publicKey = req.headers["public-key"]; // Fetch public key from headers

    // Ensure the user is an admin
    if (!ADMINS.includes(publicKey)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Post.delete(id, publicKey);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});


app.post("/address-info", createRateLimiter(100, 15), async (req, res) => {
  const schema = Joi.object({
    address: Joi.string().max(58).required()
  });

  const { error } = schema.validate(req.body, () => {});

  if (error) {
    res.status(401).send(error.details[0].message);
    return;
  }

  try {
    const address = await addressInfo(req.body);
    const balance = await getTokenBalance(req.body.address); // Fetch BEBE balance
    address.balance = balance; // Attach the balance to the response
    req.session.publicKey = address.address;
    res.send(address);
  } catch (error) {
    console.error("Error fetching address info or balance:", error.message);
    res.status(409).send({ error: error.message });
  }
});

// Endpoint for fetching transaction history
app.get("/transaction-history", createRateLimiter(100, 15), async (req, res) => {
  const { walletAddress, days } = req.query;

  // Validate query parameters
  if (!walletAddress || !days) {
    return res.status(400).json({ error: "Wallet address and days are required" });
  }

  try {
    // Fetch transaction history based on wallet and days
    const transactionHistory = await getTransactionHistory(walletAddress, parseInt(days));

    res.json(transactionHistory);
  } catch (error) {
    console.error("Error fetching transaction history:", error.message);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

app.post(
  "/address-info-form",
  createRateLimiter(100, 15),
  banStatus,
  addressStorage.upload.single("avatar"),
  addressStorage.saveImageAndThumbnail,
  async (req, res) => {
    const schema = Joi.object({
      address: Joi.string().max(58).required(),
      username: Joi.string().min(4).max(25),
      email: Joi.string().email().allow(null, "").optional(),
    });

    const { error } = schema.validate(req.body, () => {});
    if (error) {
      res.status(401).send(error.details[0].message);
      return;
    }

    try {
      const address = await addressInfo(req.body, req.file?.filename);
      res.send(address);
    } catch (error) {
      res.status(409).send({ error: error.message });
    }
  }
);

app.post(
  "/toggle-address-ban",
  createRateLimiter(100, 15),
  banStatus,
  publicKeyIsRequired,
  onlyAdminAction,
  async (req, res) => {
    const schema = Joi.object({
      walletAddress: Joi.string().max(58).required(),
    });

    const { error } = schema.validate(req.body, () => {});
    if (error) {
      res.status(401).send(error.details[0].message);
      return;
    }

    try {
      const address = await Address.toggleAddressBan(
        req.body.walletAddress,
        req.session.publicKey
      );
      res.send(address);
    } catch (error) {
      res.status(409).send({ error: error.message });
    }
  }
);

app.post(
  "/comments",
  createRateLimiter(100, 15),
  banStatus,
  publicKeyIsRequired,
  async (req, res) => {
    const schema = Joi.object({
      postId: Joi.number().integer().max(23000).precision(0).required(),
      commentId: Joi.number().integer().max(23000).precision(0).optional(),
      type: Joi.string().max(10).required(),
      content: Joi.string().min(2).max(1001).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      res.status(401).send(error.details[0].message);
      return;
    }

    try {
      const newComment = new Comment({
        ...req.body,
        walletAddress: req.session.publicKey,
      });

      await newComment.save();

      res.send(newComment);
    } catch (error) {
      res.status(409).send({ error: error.message });
    }
  }
);

app.set("trust proxy", 1);

app.listen(process.env.APP_PORT, () => {
  console.log("Baby DAO is running on port " + process.env.APP_PORT);
});