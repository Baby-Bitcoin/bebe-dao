const { currentUnixTimestamp, shorthandAddress } = require("./utilities");
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

    let postComments = (await dbConnection.getKey(InMemoryDB.COMMENTS_DB, this.postId)) || [];
    this.data.id = postComments.length + 1;

    if (this.type == "reply") {
      console.log('Reply to ID or ID ?: ', this.postId);
      postComments.forEach((comment) => {
        if (comment.id == this.commentId) {
          comment.replies = [this.data, ...comment.replies];
        }
      });
    } else {
      postComments.push(this.data);
    }
    
    await dbConnection.setKey(
      InMemoryDB.COMMENTS_DB,
      this.postId,
      postComments
    );

    console.log('Commment ID: ', this.postId);
  }

  static async mergeCommentAddress(comment) {
    const address = await dbConnection.getKey(
      InMemoryDB.ADDRESSES_DB,
      comment.walletAddress
    );

    comment.username =
      address.username || shorthandAddress(comment.walletAddress);
    comment.avatarUrl = address.avatarUrl;

    return comment;
  }
}

module.exports = Comment;
