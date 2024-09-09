const { currentUnixTimestamp, shorthandAddress } = require("./utilities");
const RedisClient = require("./redis");
const Post = require("./post");

class Comment {
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
    const post = await Post.find(this.postId);
    if (!post) {
      throw new Error("Post doesn't exist");
    }

    if (!Post.areCommentsAllowed(post)) {
      throw new Error("Comments will be opened after the voting period ends");
    }

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
}

module.exports = Comment;
