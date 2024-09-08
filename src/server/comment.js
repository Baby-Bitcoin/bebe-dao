const { currentUnixTimestamp, shorthandAddress } = require("./utilities");
const RedisClient = require("./redis");

module.exports = class Comment {
  constructor(commentData) {
    this.postId = commentData.postId;
    this.data = {
      // type: commentData.type,
      // postId: commentData.postId,
      walletAddress: commentData.walletAddress,
      content: commentData.content,
      commentedAt: currentUnixTimestamp(),
      replies: [],
    };
  }

  async save() {
    let postComments =
      (await RedisClient.jsonget(RedisClient.COMMENTS_DB, this.postId)) || [];

    this.data.id = postComments.length + 1;
    postComments.push(this.data);

    await RedisClient.jsonset(
      RedisClient.COMMENTS_DB,
      this.postId,
      postComments
    );
  }

  static async findByPostId(postId) {
    const comments =
      (await RedisClient.jsonget(RedisClient.COMMENTS_DB, postId)) || [];

    for (const comment of comments) {
      const address = await RedisClient.jsonget(
        RedisClient.ADDRESSES_DB,
        comment.walletAddress
      );

      comment.username =
        address.username || shorthandAddress(comment.walletAddress);
      comment.avatarUrl = address.avatarUrl;
    }

    return comments.reverse();
  }
};
