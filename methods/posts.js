const fs = require("fs");
const sharp = require("sharp");

function addHoursToUTC(date, H) {
  const passedDate = new Date(date);
  passedDate.setUTCHours(passedDate.getUTCHours() + H);
  return passedDate;
}

module.exports = class Post {
  constructor(postData) {
    this.id = 0;
    this.type = postData.type;
    this.user = postData.user;
    //    this.approved = true
    this.title = postData.title;
    this.duration = postData.duration;
    this.image = `${postData.filename || ""}`;
    this.description = postData.description;
    this.options = postData.options;
    postData.type === "proposal" ? (this.options = ["For", "Against"]) : null;
    postData.type === "issue"
      ? (this.options = ["Resolved", "Unresolved"])
      : null;
    this.date = new Date();
    this.tags = postData.tags;
    this.votes = postData.votes?.map((vote) => parseInt(vote));
  }

  save() {
    let newID = 0;
    // read votes file first
    fs.readFile("./data/votes.json", (err, fileContent) => {
      let newVotes = [];
      if (!err) {
        newVotes = JSON.parse(fileContent);
      }

      let maxId = 0;
      for (let i = 0; i < newVotes.length; i++) {
        if (newVotes[i].id > maxId) {
          maxId = newVotes[i].id;
        }
      }
      newID = maxId + 1;
      this.id = newID;

      let newPostData = {};

      newPostData.id = newID;
      newPostData.user = this.user;

      const postDuration = parseInt(this.duration) * 24;

      newPostData.expires = addHoursToUTC(this.date, postDuration);
      newPostData.votes = this.votes;
      newPostData.voted = false;

      newVotes.push(newPostData);

      // save votes file first
      fs.writeFile("./data/votes.json", JSON.stringify(newVotes), (err) => {
        console.log(err);
      });

      // create the comments file
      fs.writeFile("./data/comments/#" + this.id + ".json", "[]", (err) => {
        console.log(err);
      });

      // save the rest of the important data from user, this will never change
      fs.readFile(`./data/posts.json`, (err, fileContent) => {
        let userFile = {};
        if (!err) {
          userFile = JSON.parse(fileContent);
        }

        let newEntry = this;
        delete newEntry["votes"];

        userFile.push(newEntry);

        fs.writeFile(`./data/posts.json`, JSON.stringify(userFile), (err) => {
          console.log(err);
        });
      });
    });
  }
};

module.exports.Vote = async function (obj) {
  fs.readFile("./data/votes.json", (err, fileContent) => {
    let votesFile;
    if (!err) {
      votesFile = JSON.parse(fileContent);
    }

    votesFile.map((el, i) => {
      if (el.id === obj.id) {
        votesFile[i].votes[obj.vote] += 1;
        let votingUsers = [];
        if (votesFile[i].voted === false) {
          votingUsers.push(obj.user);
          votesFile[i].voted = votingUsers;
        } else {
          votesFile[i].voted.push(obj.user);
        }
      }
    });

    fs.writeFile("./data/votes.json", JSON.stringify(votesFile), (err) => {
      console.log("Voting error: " + err);
    });
  });

  fs.readFile(`./data/members.json`, (err, fileContent) => {
    let membersFile = {};
    if (!err) {
      membersFile = JSON.parse(fileContent);
    }
    membersFile[obj.user].lastVoted = new Date();

    fs.writeFile(`./data/members.json`, JSON.stringify(membersFile), (err) => {
      console.log(err);
    });
  });
};
