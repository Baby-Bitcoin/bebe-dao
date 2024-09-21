const { currentUnixTimestamp } = require("./utilities");
const { InMemoryDB, dbConnection } = require('./butterfly');
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

    let updatedComments = (await dbConnection.getKey(InMemoryDB.COMMENTS_DB, this.postId)) || [];

    this.data.id = updatedComments.length + 1;


    if (this.type == "reply") {
      updatedComments.forEach((comment) => {
        if (comment.id == this.commentId) {
          comment.replies = [this.data, ...comment.replies];
        }
      });
    } else {
      updatedComments.push(this.data);
    }

    await dbConnection.setKey(
      InMemoryDB.COMMENTS_DB,
      this.postId,
      updatedComments
    );
  }
}

module.exports = Comment;
