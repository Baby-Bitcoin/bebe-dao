const fs = require('fs')
const sharp = require('sharp')


function addHoursToUTC(date, H) {
  const passedDate = new Date(date)
  passedDate.setUTCHours(passedDate.getUTCHours() + H)
  return passedDate
}

module.exports = class Post {

  constructor(postData) {
    this.id = 0
    this.type = postData.type
    this.user = postData.user
    //    this.approved = true
    this.title = postData.title
    this.duration = postData.duration
    this.image = `${postData.filename || ''}`
    this.description = postData.description
    this.options = postData.options
    postData.type === 'proposal' ? this.options = ['For', 'Against'] : null
    postData.type === 'issue' ? this.options = ['Resolved', 'Unresolved'] : null
    this.date = new Date()
    this.tags = postData.tags
    this.votes = postData.votes?.map((vote) => parseInt(vote))
  }


  save() {

    let newID = 0
    // read votes file first
    fs.readFile('./data/votes.json', (err, fileContent) => {

      let newVotes = []
      if (!err) {
        newVotes = JSON.parse(fileContent)
      }

      let maxId = 0;
      for (let i = 0; i < newVotes.length; i++) {
        if (newVotes[i].id > maxId) {
          maxId = newVotes[i].id;
        }
      }
      newID = maxId + 1
      this.id = newID

      let newPostData = {}

      newPostData.id = newID
      newPostData.user = this.user

      const postDuration = parseInt(this.duration) * 24

      newPostData.expires = addHoursToUTC(this.date, postDuration)
      newPostData.votes = this.votes
      newPostData.voted = false

      newVotes.push(newPostData)

      // save votes file first
      fs.writeFile('./data/votes.json', JSON.stringify(newVotes), err => {
        console.log(err)
      })

      // create the comments file
      fs.writeFile('./data/comments/#' + this.id + '.json', '[]', err => {
        console.log(err)
      })

      // save the rest of the important data from user, this will never change
      fs.readFile(`./data/posts.json`, (err, fileContent) => {
        let userFile = {}
        if (!err) {
          userFile = JSON.parse(fileContent)
        }

        let newEntry = this
        delete newEntry['votes']


        userFile.push(newEntry)

        fs.writeFile(`./data/posts.json`, JSON.stringify(userFile), err => {
          console.log(err)
        })
      })
    })
  }

}

module.exports.Vote = async function (obj) {
  fs.readFile('./data/votes.json', (err, fileContent) => {
    let votesFile
    if (!err) {
      votesFile = JSON.parse(fileContent)
    }

    votesFile.map((el, i) => {
      if (el.id === obj.id) {
        votesFile[i].votes[obj.vote] += 1
        let votingUsers = []
        if (votesFile[i].voted === false) {
          votingUsers.push(obj.user)
          votesFile[i].voted = votingUsers
        } else {
          votesFile[i].voted.push(obj.user)
        }
      }
    })

    fs.writeFile('./data/votes.json', JSON.stringify(votesFile), err => {
      console.log('Voting error: ' + err)
    })
  })


  fs.readFile(`./data/members.json`, (err, fileContent) => {
    let membersFile = {}
    if (!err) {
      membersFile = JSON.parse(fileContent)
    }
    membersFile[obj.user].lastVoted = new Date()

    fs.writeFile(`./data/members.json`, JSON.stringify(membersFile), err => {
      console.log(err)
    })
  })
}

module.exports.userInfo = async function (user, authenticating) {

  // read members file
  let members = JSON.parse(fs.readFileSync(`./data/members.json`))

  // let's check if the user is verified and has the minimum token balance required and send back the response
  const { rows } = ''
  let kyc

  rows[0].kyc[0] != undefined ? kyc = rows[0].kyc[0].kyc_level.includes('birthdate' || 'selfie' || 'frontofid') : kyc = false
  const balance = await soslanaApi.getTokenBalance('grat', user, 'GRAT') || 0

  if (!members || !members[user]) {
    members[user] = {
      "kyc": kyc,
      "banned": false,
      "balance": parseInt(balance)
    }
    fs.writeFileSync(`./data/members.json`, JSON.stringify(members))
  } else {
    if (members[user].kyc !== kyc || members[user].balance !== parseInt(balance)) {
      fs.writeFileSync(`./data/members.json`, JSON.stringify(members))
    }
  }

  let avatar
  if (authenticating == 'true') {
    avatar = rows[0].avatar || 'PHN2ZyBmaWxsPSIjMDAzZTkxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI0IDI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMwMDNlOTEiIGQ9Ik0xMiAwQzUuNCAwIDAgNS40IDAgMTJzNS40IDEyIDEyIDEyIDEyLTUuNCAxMi0xMlMxOC42IDAgMTIgMHptMCA0YzIuMiAwIDQgMi4yIDQgNXMtMS44IDUtNCA1LTQtMi4yLTQtNSAxLjgtNSA0LTV6bTYuNiAxNS41QzE2LjkgMjEgMTQuNSAyMiAxMiAyMnMtNC45LTEtNi42LTIuNWMtLjQtLjQtLjUtMS0uMS0xLjQgMS4xLTEuMyAyLjYtMi4yIDQuMi0yLjcuOC40IDEuNi42IDIuNS42czEuNy0uMiAyLjUtLjZjMS43LjUgMy4xIDEuNCA0LjIgMi43LjQuNC40IDEtLjEgMS40eiIvPjwvc3ZnPg=='

    // create buffer for sharp
    const imgBuffer = Buffer.from(avatar, 'base64')

    try {
      const avatarPromise = new Promise((resolve, reject) => {
        sharp(imgBuffer)
          .resize(320)
          .toFile(`./shield/avatars/${user}.webp`, (err, info) => {
            if (err) {
              reject(err)
              console.log('Error saving avatar: ' + err)
            } else {
              resolve()
            }
          })
      })
      await avatarPromise
    } catch (e) {
      console.error(e)
    }
  }

  return { "balance": parseInt(balance).toFixed(2), "kyc": kyc }
}