const fs = require("fs");

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
