const { InMemoryDB, dbConnection } = require('./butterfly');
const { currentUnixTimestamp } = require("./utilities");

module.exports = class Vote {
  
  constructor(voteData) {
    this.postId = voteData.postId;
    this.optionIndex = voteData.optionIndex;
    this.walletAddress = voteData.walletAddress;
  }

  async save() {
    const post = await dbConnection.getKey(InMemoryDB.POSTS_DB, this.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    let postVotes = await dbConnection.getKey(
      InMemoryDB.VOTES_DB,
      this.postId
    );

    if (!postVotes) {
      const prefills = new Array(post.options.length).fill(0);
      postVotes = {
        firstVoteAt: currentUnixTimestamp(),
        votes: [...prefills],
        voters: [],
        weight: [...prefills],
      };
    }

    if (postVotes.voters.includes(this.walletAddress)) {
      throw new Error("You already have voted");
    }

    postVotes.voters.push(this.walletAddress);
    postVotes.votes[this.optionIndex] += 1;
    postVotes.weight[this.optionIndex] += 1;

    await dbConnection.setKey(InMemoryDB.VOTES_DB, this.postId, postVotes);
    return dbConnection.getKey(InMemoryDB.VOTES_DB, this.postId);
  }
};
