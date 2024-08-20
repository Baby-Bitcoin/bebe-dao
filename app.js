const path = require('path')
const express = require('express')
const multer = require("multer") // we use this for storing images and other files sent from the user
const Joi = require('joi') // this is for data validation sent from front-end
const fs = require('fs') // this is for saving or reading files to the server
const Post = require('./methods/posts') // class / constructor
const { Vote, userInfo } = require('./methods/posts') // functions ?  variables


global.admins = ["lucianape3"]

// configuration for multer
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './shield/uploads/')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/")
    let extension = extArray[extArray.length - 1]
    let newFileName = file.fieldname + '-' + Date.now() + '.' + extension
    cb(null, newFileName)
  }
})

const upload = multer({ storage: storage })

const app = express()


// express.json to decifer json data from incoming requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public_html')))

// GETs all data from posts.json file 
app.get('/getposts', (req, res) => {

  let readPosts = {}
  let readVotes = {}
  let members = {}
  //let comments

  // filter posts and votes object based on: if the user requesting is an admin or regular user
  // if (req.query.user) {
  // } else {
  //   // if the user is not present or is not an admin
  //   const filteredPosts = readPosts.filter(post => post.approved)
  //   const filteredVotes = readVotes.filter(vote => {
  //     const post = filteredPosts.find(p => p.id === vote.id)
  //     return post && post.approved
  //   })

  //   readPosts = filteredPosts
  //   readVotes = filteredVotes
  // }

  if (req.query.id) {
    //let posts = readPosts.filter(title => title.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') === req.query.title)
    let posts = readPosts.filter(id => id.id == req.query.id)

    let votes
    let comments = {}
    if (posts[0]) {
      if (fs.existsSync(`./data/comments/#${posts[0].id}.json`)) {
        comments.comments = JSON.parse(fs.readFileSync('./data/comments/#' + posts[0].id + '.json'))
      } else { comments = null }
    }
    if (posts.length > 0) {
      votes = readVotes.filter(vote => vote.id === posts[0].id)
    } else {
      posts, votes, comments = null
    }
    res.send({ posts, votes, comments, members })
  }

  else if (req.query.tag) {
    let posts = readPosts.filter(post => post.tags.includes(req.query.tag))
    let votes = []

    if (posts.length > 0) {
      posts.forEach((el, i) => {
        let oneObject = readVotes.filter(vote => vote.id === el.id)
        votes.push(oneObject[0])
      })
    } else {
      posts, votes = null
    }
    res.send({ posts, votes, members })
  }

  else if (req.query.search) {

    const s = req.query.search
    let votes = []
    let posts = []

    const searchStringInJSON = (str, json) => {
      const string = str.toLowerCase()
      json.forEach(object => {

        for (var key in object) {
          if (key === 'title' && object[key].toLowerCase().includes(string)) {
            posts.push(object)
            votes.push(readVotes.filter(vote => vote.id === object.id)[0])
            break
          }
          if (key === 'tags' && object[key].toLowerCase().includes(string)) {
            posts.push(object)
            votes.push(readVotes.filter(vote => vote.id === object.id)[0])
            break
          }
          if (key === 'options') {
            const stringifiedOptions = JSON.stringify(object.options).toLowerCase().replace(/ /g, '').replace(/[^\w-]+/g, ',')
            if (stringifiedOptions.includes(string)) {
              posts.push(object)
              votes.push(readVotes.filter(vote => vote.id === object.id)[0])
              break
            }
          }
          if (key === 'description') {
            const stringifiedOptions = JSON.stringify(object.description).toLowerCase()

            if (stringifiedOptions.includes(string)) {
              posts.push(object)
              votes.push(readVotes.filter(vote => vote.id === object.id)[0])
              break
            }
          }
        }

      })
      return posts
    }

    posts = searchStringInJSON(s, readPosts)

    res.send({ posts, votes, members })
  }

  else {
    const posts = readPosts
    const votes = readVotes
    res.send({ posts, votes, members })
  }

})


// POST to the posts.json file
app.post('/post', upload.single("image"), (req, res) => {


  // Joi Schema = how the incoming input data is validated
  const schema = {
    user: Joi.string().max(23).required(),
    title: Joi.string().max(124).required(),
    duration: Joi.number().integer().min(1).max(30).required(),
    description: Joi.string().max(10001).required(), // apparently you need to add 1 extra character because it does not match front-end otherwise
    options: Joi.array().max(1025).required(),
    tags: Joi.string().max(124).required(),
    type: Joi.string().max(13).required(),
    votes: Joi.array().max(1025).required()
  }

  const { error } = Joi.validate(req.body, schema)

  if (error) {
    res.status(401).send(error.details[0].message)
    return
  } else {
    const post = new Post({ ...req.body, ...req.file })
    post.save()

    res.send({ "status": 200, "id": 0 })
  }
})


app.post('/vote', (req, res) => {
  // Joi Schema = how the incoming input data is validated
  const schema = {
    id: Joi.number().integer().max(23000).precision(0).required(),
    user: Joi.string().max(13).required(),
    vote: Joi.number().integer().max(10).precision(0).required()
  }

  const { error } = Joi.validate(req.body, schema)

  if (error) {
    res.status(401).send(error.details[0].message)
    return
  } else {
    Vote(req.body)
    res.send({ "status": 200 })
  }
})


app.put('/delete', (req, res) => {
  try {
    const posts = JSON.parse(fs.readFileSync(`./data/posts.json`))
    const votes = JSON.parse(fs.readFileSync(`./data/votes.json`))
    const imageToDelete = posts.filter(post => post.id === parseInt(req.body.id))
    const filteredPosts = posts.filter(post => post.id !== parseInt(req.body.id))
    const filteredVotes = votes.filter(vote => vote.id !== parseInt(req.body.id))

    // delete the image
    imageToDelete[0].image !== '' ? fs.unlinkSync('shield/uploads/' + imageToDelete[0].image) : null

    // delete the comments file
    fs.unlinkSync('./data/comments/#' + req.body.id + '.json')


    fs.writeFileSync(`./data/posts.json`, JSON.stringify(filteredPosts))
    fs.writeFileSync(`./data/votes.json`, JSON.stringify(filteredVotes))

    res.send({ "status": 200 })
  } catch (err) {
    console.error('Delete error: ' + err)
  }
})


app.get('/userinfo', async (req, res) => {
  const returnedObject = await userInfo(req.query.user, req.query.login)
  res.send(returnedObject)
})


app.post('/comment', (req, res) => {
  let commentData = {}
  commentData.id = req.body.commentid
  commentData.user = req.body.user
  commentData.text = req.body.comment
  //Joi Schema = how the incoming input data is validated
  const schema = {
    user: Joi.string().max(23).required(),
    postid: Joi.number().integer().max(23000).precision(0).required(),
    commentid: Joi.number().max(23000).precision(0).required(),
    type: Joi.string().max(10).required(),
    comment: Joi.string().min(2).max(1001).required()
  }

  const { error } = Joi.validate(req.body, schema)

  let commentsFile = []

  if (error) {
    res.status(401).send(error.details[0].message)
    return
  } else {
    if (fs.existsSync(`./data/comments/#${req.body.postid}.json`)) {
      commentsFile = JSON.parse(fs.readFileSync(`./data/comments/#${req.body.postid}.json`))
    } else { commentsFile = [] }

    let count = 1
    // Define the recursive function
    function countKeys(obj) {
      for (const key in obj) {
        if (key === "id") {
          count++;
        }

        const value = obj[key];
        if (typeof value === "object") {
          countKeys(value);
        }
      }
    }

    countKeys(commentsFile)

    commentData.id = count

    if (req.body.type === 'comment') {
      commentData.replies = []
      commentsFile.push(commentData)
    } else {
      const comment = commentsFile.find(comment => comment.id === req.body.commentid);
      comment.replies.push(commentData)
    }

    fs.writeFileSync(`./data/comments/#${req.body.postid}.json`, JSON.stringify(commentsFile))

    res.send({ "status": 200 })
  }
})

app.listen(9632)