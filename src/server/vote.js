const RedisClient = require("./redis");
const { currentUnixTimestamp } = require("./utilities");

module.exports = class Comment {
  constructor(voteData) {
    this.postId = voteData.postId;
    this.optionIndex = voteData.optionIndex;
    this.walletAddress = voteData.walletAddress;
  }

  async save() {
    const post = await RedisClient.jsonget(RedisClient.POSTS_DB, this.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    let postVotes = await RedisClient.jsonget(
      RedisClient.VOTES_DB,
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

    await RedisClient.jsonset(RedisClient.VOTES_DB, this.postId, postVotes);
    return RedisClient.jsonget(RedisClient.VOTES_DB, this.postId);
  }
};

// module.exports.Vote = async function (obj) {
//   fs.readFile("./data/votes.json", (err, fileContent) => {
//     let votesFile;
//     if (!err) {
//       votesFile = JSON.parse(fileContent);
//     }

//     votesFile.map((el, i) => {
//       if (el.id === obj.id) {
//         votesFile[i].votes[obj.vote] += 1;
//         let votingUsers = [];
//         if (votesFile[i].voted === false) {
//           votingUsers.push(obj.user);
//           votesFile[i].voted = votingUsers;
//         } else {
//           votesFile[i].voted.push(obj.user);
//         }
//       }
//     });

//     fs.writeFile("./data/votes.json", JSON.stringify(votesFile), (err) => {
//       console.log("Voting error: " + err);
//     });
//   });

//   fs.readFile(`./data/members.json`, (err, fileContent) => {
//     let membersFile = {};
//     if (!err) {
//       membersFile = JSON.parse(fileContent);
//     }
//     membersFile[obj.user].lastVoted = new Date();

//     fs.writeFile(`./data/members.json`, JSON.stringify(membersFile), (err) => {
//       console.log(err);
//     });
//   });
// };
