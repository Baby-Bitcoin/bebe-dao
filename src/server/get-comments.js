const { shorthandAddress } = require("./utilities");
const { InMemoryDB, dbConnection } = require("./butterfly");

module.exports = class GetComments {
  static async findPost(postId) {
    // Retrieve comments from the database
    const comments =
      (await dbConnection.getKey(InMemoryDB.COMMENTS_DB, postId)) || [];

    // Create a new array to store modified comments
    const modifiedComments = [];

    for (let index = 0; index < comments.length; index++) {
      // Merge address for the main comment
      const mergedComment = await this.mergeCommentAddress({ ...comments[index] });
      
      // Create a new array for replies to avoid mutating the original object
      const modifiedReplies = [];
      for (let index2 = 0; index2 < mergedComment.replies.length; index2++) {
        // Merge address for each reply and push to the replies array
        const mergedReply = await this.mergeCommentAddress({ ...mergedComment.replies[index2] });
        modifiedReplies.push(mergedReply);
      }

      // Assign modified replies back to the main comment
      mergedComment.replies = modifiedReplies;

      // Push the modified comment to the new array
      modifiedComments.push(mergedComment);
    }

    // Return the modified comments in reverse order
    return modifiedComments.reverse();
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
};
