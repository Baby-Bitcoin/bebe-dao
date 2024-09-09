const path = require("path");
const express = require("express");
const session = require("express-session");
const multer = require("multer"); // we use this for storing images and other files sent from the user
const Joi = require("joi"); // this is for data validation sent from front-end
const fs = require("fs"); // this is for saving or reading files to the server
const Post = require("./src/server/post");
const Comment = require("./src/server/comment");
const Vote = require("./src/server/vote"); // functions ?  variables
const { addressInfo } = require("./src/server/address");
const { env } = require("process");
const { createRateLimiter } = require("./src/server/limiter");

global.admins = ["lucianape3"];

// configuration for multer
const postImagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = "./public_html/images/posts";
    fs.mkdirSync(path, { recursive: true });
    return cb(null, path);
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    let newFileName = file.fieldname + "-" + Date.now() + "." + extension;
    cb(null, newFileName);
  },
});
const uploadPostImage = multer({ storage: postImagesStorage });

const addressAvatarsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = "./public_html/images/addresses";
    fs.mkdirSync(path, { recursive: true });
    return cb(null, path);
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    let newFileName = file.fieldname + "-" + Date.now() + "." + extension;
    cb(null, newFileName);
  },
});
const uploadAddressAvatar = multer({ storage: addressAvatarsStorage });

const app = express();
app.use(
  session({
    secret: env.SESSION_KEY, // Replace with a secure key
    resave: false, // Prevents session from being saved back to the session store if it wasn't modified
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
// app.use(createRateLimiter(100, 15));

// express.json to decifer json data from incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public_html")));

app.get("/posts/:postId", createRateLimiter(100, 15), async (req, res) => {
  const data = await Post.find(req.params.postId);

  res.send(data);
});

app.get("/posts", createRateLimiter(100, 15), async (req, res) => {
  const posts = await Post.all(req.query);
  res.send(posts);
});

app.post(
  "/post",
  createRateLimiter(100, 15),
  uploadPostImage.single("image"),
  async (req, res) => {
    if (!req.session.publicKey) {
      res
        .status(401)
        .send({ error: "Make sure your Solana wallet is connected" });
      return;
    }

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
    // Make sure wallet has at least $MINI_TOKEN_BALANCE_FOR_POST to post

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

app.post("/vote", createRateLimiter(100, 15), async (req, res) => {
  if (!req.session.publicKey) {
    res
      .status(401)
      .send({ error: "Make sure your Solana wallet is connected" });
    return;
  }

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

  const vote = new Vote({ ...req.body, walletAddress: req.session.publicKey });
  try {
    const newVotes = await vote.save();
    res.send(newVotes);
  } catch (error) {
    res.status(409).send({ error: error.message });
  }
});

app.put("/delete", createRateLimiter(100, 15), (req, res) => {
  try {
    const posts = JSON.parse(fs.readFileSync(`./data/posts.json`));
    const votes = JSON.parse(fs.readFileSync(`./data/votes.json`));
    const imageToDelete = posts.filter(
      (post) => post.id === parseInt(req.body.id)
    );
    const filteredPosts = posts.filter(
      (post) => post.id !== parseInt(req.body.id)
    );
    const filteredVotes = votes.filter(
      (vote) => vote.id !== parseInt(req.body.id)
    );

    // delete the image
    imageToDelete[0].image !== ""
      ? fs.unlinkSync("shield/uploads/" + imageToDelete[0].image)
      : null;

    // delete the comments file
    fs.unlinkSync("./data/comments/#" + req.body.id + ".json");

    fs.writeFileSync(`./data/posts.json`, JSON.stringify(filteredPosts));
    fs.writeFileSync(`./data/votes.json`, JSON.stringify(filteredVotes));

    res.send({ status: 200 });
  } catch (err) {
    console.error("Delete error: " + err);
  }
});

app.post("/address-info", createRateLimiter(100, 15), async (req, res) => {
  const schema = Joi.object({
    address: Joi.string().max(58).required(),
  });

  const { error } = schema.validate(req.body, () => {});

  if (error) {
    res.status(401).send(error.details[0].message);
    return;
  }

  const address = await addressInfo(req.body);
  req.session.publicKey = address.address;
  res.send(address);
});

app.post(
  "/address-info-form",
  createRateLimiter(100, 15),
  uploadAddressAvatar.single("avatar"),
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
    } else {
      const address = await addressInfo(req.body, req.file?.filename);
      res.send(address);
    }
  }
);

app.post("/comments", createRateLimiter(100, 15), (req, res) => {
  if (!req.session.publicKey) {
    res
      .status(401)
      .send({ error: "Make sure your Solana wallet is connected" });
    return;
  }

  const schema = Joi.object({
    postId: Joi.number().integer().max(23000).precision(0).required(),
    commentId: Joi.number().integer().max(23000).precision(0).optional(),
    type: Joi.string().max(10).required(),
    content: Joi.string().min(2).max(1001).required(),
  });

  const { error } = schema.validate(req.body, () => {});

  if (error) {
    res.status(401).send(error.details[0].message);
    return;
  }

  const comment = new Comment({
    ...req.body,
    walletAddress: req.session.publicKey,
  });

  comment.save();

  res.send(comment);
});

app.listen(9632);
