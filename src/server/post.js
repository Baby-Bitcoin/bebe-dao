const fs = require("fs");
const { currentUnixTimestamp } = require("./utilities");

function addHoursToUTC(date, H) {
  const passedDate = new Date(date);
  passedDate.setUTCHours(passedDate.getUTCHours() + H);
  return passedDate;
}

module.exports = class Post {
  constructor(postData) {
    this.id = 0;
    this.type = postData.type;
    this.walletAddress = postData.walletAddress;
    this.title = postData.title;
    this.duration = postData.duration;
    this.imageUrl = `${postData.filename || ""}`;
    this.description = postData.description;
    this.options = postData.options;
    postData.type === "proposal" ? (this.options = ["For", "Against"]) : null;
    postData.type === "issue"
      ? (this.options = ["Resolved", "Unresolved"])
      : null;
    this.createdAt = currentUnixTimestamp();
    this.tags = postData.tags;
    this.votes = postData.votes?.map((vote) => parseInt(vote));
    this.quorum = postData.quorum;
  }

  save() {
    // TO-DO:
    // Make sure wallet has at least $MINI_TOKEN_BALANCE_FOR_POST to post

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
