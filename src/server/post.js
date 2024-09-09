const { currentUnixTimestamp, shorthandAddress } = require("./utilities");
const RedisClient = require("./redis");
const Comment = require("./comment");
const { ADMINS } = require("./configs");
const fs = require("fs");
const path = require("path");

const IMAGE_PREFIX = path.join(
  __dirname,
  "..",
  "..",
  "public_html",
  "images",
  "posts"
);

module.exports = class Post {
  constructor(postData) {
    let options = postData.options;
    switch (postData.type) {
      case "proposal":
        options = ["For", "Against"];
        break;
      case "issue":
        options = ["Resolved", "Unresolved"];
        break;
      default:
        break;
    }

    this.data = {
      type: postData.type,
      walletAddress: postData.walletAddress,
      title: postData.title,
      imageUrl: `${postData.filename || ""}`,
      description: postData.description,
      options: options,
      createdAt: currentUnixTimestamp(),
      expiresAt:
        currentUnixTimestamp() + parseInt(postData.duration) * 24 * 3600,
      tags: postData.tags,
      votes: postData.votes?.map((vote) => parseInt(vote)),
      quorum: parseInt(postData.quorum),
    };
  }

  async save() {
    this.data.id = await RedisClient.getNewId(RedisClient.POSTS_DB);

    // TO-DO:
    // get balanceAtPosting
    //

    this.data.totalCurrentAddresses = (
      await RedisClient.getAllKeys(RedisClient.ADDRESSES_DB)
    ).length;
    await RedisClient.jsonset(RedisClient.POSTS_DB, this.data.id, this.data);
    return RedisClient.jsonget(RedisClient.POSTS_DB, this.data.id);
  }

  static async find(postId) {
    const post = await RedisClient.jsonget(RedisClient.POSTS_DB, postId);
    if (!post) {
      return post;
    }

    const address = await RedisClient.jsonget(
      RedisClient.ADDRESSES_DB,
      post.walletAddress
    );

    const votes =
      (await RedisClient.jsonget(RedisClient.VOTES_DB, post.id)) || [];
    const comments = await Comment.findByPostId(post.id);

    return { post, address, votes, comments };
  }

  static async all(filters = {}) {
    let posts = await RedisClient.getAll(RedisClient.POSTS_DB);

    if (filters.type && filters.type != "all") {
      posts = posts.filter((post) => post.type == filters.type);
    }

    if (filters.address) {
      posts = posts.filter((post) => post.walletAddress == filters.address);
    }

    if (filters.query) {
      posts = posts.filter((post) =>
        Boolean(this.queryMatchesPost(filters.query, post))
      );
    }

    for (const post of posts) {
      const address = await RedisClient.jsonget(
        RedisClient.ADDRESSES_DB,
        post.walletAddress
      );
      post.username = address.username || shorthandAddress(post.walletAddress);
    }

    return posts.reverse();
  }

  static async delete(postId, publicKey) {
    const post = await RedisClient.jsonget(RedisClient.POSTS_DB, postId);
    if (!post) {
      throw new Error("Post doesn't exist");
    }

    const isAuthorized =
      publicKey === post.walletAddress || ADMINS.includes(publicKey);
    if (!isAuthorized) {
      throw new Error("Not authorized to delete this post");
    }
    await RedisClient.delete(RedisClient.POSTS_DB, post.id);
    fs.rmSync(path.join(IMAGE_PREFIX, post.imageUrl), { force: true });
  }

  static queryMatchesPost(query, post) {
    query = query.toLowerCase();

    if (post.title.toLowerCase().includes(query)) {
      return post;
    } else if (post.tags.toLowerCase().includes(query)) {
      return post;
    } else if (post.description.toLowerCase().includes(query)) {
      return post;
    } else if (
      post.options.join("").toLowerCase().includes(query) ||
      post.options.join("").toLowerCase().includes(query.replace(/\s+/, ""))
    ) {
      return post;
    } else {
      return null;
    }
  }
};
