const { currentUnixTimestamp, shorthandAddress } = require("./utilities");
const RedisClient = require("./redis");

module.exports = class Comment {
  constructor(commentData) {
    this.type = commentData.type;
    this.postId = commentData.postId;
    this.commentId = commentData.commentId;
    this.data = {
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

    if (this.type == "reply") {
      postComments.forEach((comment) => {
        if (comment.id == this.commentId) {
          comment.replies = [this.data, ...comment.replies];
        }
      });
    } else {
      postComments.push(this.data);
    }

    await RedisClient.jsonset(
      RedisClient.COMMENTS_DB,
      this.postId,
      postComments
    );
  }

  static async mergeCommentAddress(comment) {
    const address = await RedisClient.jsonget(
      RedisClient.ADDRESSES_DB,
      comment.walletAddress
    );

    comment.username =
      address.username || shorthandAddress(comment.walletAddress);
    comment.avatarUrl = address.avatarUrl;

    return comment;
  }

  static async findByPostId(postId) {
    let comments =
      (await RedisClient.jsonget(RedisClient.COMMENTS_DB, postId)) || [];

    for (let index = 0; index < comments.length; index++) {
      comments[index] = await this.mergeCommentAddress(comments[index]);
      for (let index2 = 0; index2 < comments[index].replies.length; index2++) {
        comments[index].replies[index2] = await this.mergeCommentAddress(
          comments[index].replies[index2]
        );
      }
    }

    return comments.reverse();
  }
};
