// checks if project not in production in other to use default environment variables
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const fs = require('fs');
const {v4: uuidV4} = require('uuid')
const Jimp = require('jimp')
const url = require('url')

// file uploader
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${uuidV4()}.jpg`)
  }
})

const upload =  multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
  
    cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
  } 

}).single('prfimg')

// database
const mongoose = require('mongoose')
const Userdb = require('./userschema')
const Roomdb = require('./roomschema')
mongoose.connect("mongodb://localhost/usersdb",() => {console.log('db connected')}, err => console.log(err))

async function identifyuser(person){
  const obj = await Userdb.find({ username: person })
  return obj
}

async function identifyid(id){
  const obj = await Userdb.find({ _id: id })
  return obj
}

const initPassport = require("./passport-config")
initPassport(passport, identifyuser, identifyid)


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.get('/', preventnonloggeduser, async (req, res) => {
  const dataextract = await Userdb.findOne({_id: req.user[0]._id})
  res.render('index', {
    name: req.user[0].username, 
    id: req.user[0]._id, 
    date: req.user[0].datejoined, 
    email: req.user[0].email,
    imgPath: dataextract.imgPath,
    socials: {
      facebook: dataextract.socials.facebook,
      linkedin: dataextract.socials.linkedin,
      instagram: dataextract.socials.instagram,
      twitter: dataextract.socials.twitter,
      website: dataextract.socials.website
    },
    socials_list: [
      {social: 'facebook', link: dataextract.socials.facebook},
      {social: 'linkedIn', link: dataextract.socials.linkedin},
      {social: 'instagram', link: dataextract.socials.instagram},
      {social: 'twitter', link: dataextract.socials.twitter},
      {social: 'website', link: dataextract.socials.website}
    ],
    description: dataextract.description,
    wins: 0,
    debates: dataextract.debates
  })
});

// Signing routers
const signRouters = require('./routes/signings.js')
app.use('/', signRouters)

// Room routers
const roomRouter = require('./routes/rooms.js');
app.use('/room', roomRouter)

// EDIT profile
app.post('/fillprofile', preventnonloggeduser, async (req, res) => {
  const userprf = await Userdb.findOne({_id : req.user[0]._id})

  (req.body.facebook != '') ? userprf.socials.facebook = "" : userprf.socials.facebook = req.body.facebook 
  (req.body.linkedin != '') ? userprf.socials.linkedin = "" : userprf.socials.linkedin = req.body.linkedin 
  (req.body.instagram != '') ? userprf.socials.instagram = "" : userprf.socials.instagram = req.body.instagram 
  (req.body.twitter != '') ? userprf.socials.twitter = "" : userprf.socials.twitter = req.body.twitter 
  (req.body.web != '') ? userprf.socials.website = "" : userprf.socials.website = req.body.web 
  (req.body.desc != '') ? userprf.description = "" : userprf.description = req.body.desc  
  (req.body.email != '') ? userprf.email = "" : userprf.email = req.body.email  
  
  await userprf.save()

  res.redirect('/')
})

// UPLOAD profile photo 
app.post('/upload', preventnonloggeduser, async (req, res) => {    

  const updatedoc = await Userdb.findOne({_id : req.user[0]._id})

  upload(req, res, async (err) => {
    console.log(req.file.filename)
    if (updatedoc.imgPath != ''){
      deleteprevimg(updatedoc.imgPath)
    }

    updatedoc.imgPath = await resize(150, 150, req.file.filename)
    await updatedoc.save()

    return (err) ? res.send(err) : res.redirect('/')
  })
  
      // resizing and upgrade of photo
     async function resize(x, y, path) {
      // generate random photo id for user
       const imgID = `${uuidV4()}.jpg`;

       // Reading Image
     const image = await Jimp.read(`${__dirname}/public/images/${path}`);

       // Used RESIZE_BEZIER as cb for finer images
       image.resize(x, y, Jimp.RESIZE_BEZIER, function(err){
            if (err) throw err;
         })
         .write(`${__dirname}/public/images/${imgID}`);

        deleteprevimg(path)
         return imgID
      }    
})
    

// CONFIGURATION page
app.post('/config', preventnonloggeduser, (req, res) => {

  const [status, topic, desc] = [
    encodeURIComponent(req.body.show_status), 
    encodeURIComponent(req.body.topic),
    encodeURIComponent(req.body.description),
  ]

  const queries = {
      "status": status,
      "topic": topic,
      "description": desc,
      "role": 'admin'
  }

  const irl = new URLSearchParams(queries).toString()

  res.redirect('/room?'+irl)

})

// ADDING users to room
app.post('/joinroom', preventnonloggeduser, (req, res) => {

  const queries = {
    "role": encodeURIComponent('basic'),
    "ROOMID": encodeURIComponent(req.body.room_id)
  }

  const irl = new URLSearchParams(queries).toString()
  // console.log(irl)

  res.redirect('/room?'+irl)
})

app.post('/changerole', preventnonloggeduser, async (req, res) => {
  const room_db = await Roomdb.findOne({room_id: req.body.roomID})
  let present_people = room_db.people
  let indexx;

  present_people.forEach((item, index) => {
    console.log(req.body.person_id)
    if(item.id == req.body.person_id){
      indexx = index
    } 
  })

  console.log(req.body.new_role)
  console.log(present_people)
  present_people[indexx].role = req.body.new_role

  await room_db.save()

  console.log('worked')
  console.log(req.body.call_id)
  console.log('wor')
  io.to(req.body.roomID).emit('update-role', req.body.call_id, req.body.new_role)


})


// checks for socket connections in stream rooms
io.on('connection', socket => {
  socket.on('join-room', (roomID, userID, ORGINAL_ID, NAME, ROLE, ANON) => {
    socket.join(roomID)
    // socket.on('ready', () => {
      socket.broadcast.to(roomID).emit('user-connected', userID, ORGINAL_ID, NAME, ROLE, ANON)
      console.log(userID +' connected')
    // })

    socket.on('new-stream', (id, user_num, num_list) => {
      socket.broadcast.to(roomID).emit("NEWstream", id, user_num, num_list)
      console.log('a new streamer')
    })

    socket.on('sendNAME', (sendname, sendID, sendrole, sendanon) => {
      console.log('fROM send nae'+ sendname);
      socket.broadcast.to(roomID).emit("Addname", sendname, sendID, sendrole, sendanon)
    })
    
    socket.on('sendMESSAGE', (name, message, roomid) => {
      console.log(`From ${name}: ${message} to room of ID ${roomid}`);
      socket.to(roomid).emit("Addmessage", name, message)
    })

    socket.on('send_connection_list', (list, identity) => {
      socket.broadcast.to(roomID).emit("connectionlist", list, identity, userID)
    })

    // socket.on('newconnectedlist', listed => {
    //   socket.broadcast.to(roomID).emit('newlist', listed, allusers)
    //   console.log(allusers)
    // })

    socket.on('disconnect', () => {
      socket.broadcast.to(roomID).emit('user-disconnected', userID)
      console.log(userID +' disconnected')
    })

  })
});


// middleware function that prevent unauthorized users from entering private pages
function preventnonloggeduser(req, res, next){
  if(req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

// middlware function that prevents authorized users from loging out accidentally
function preventloggeduser(req, res, next){
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }

  next()
}

function deleteprevimg(imgpath){
  const pathtoimg = `./public/images/${imgpath}`

  try {
    console.log(`Deleting... ${imgpath}`)
    fs.unlinkSync(pathtoimg)
  } catch(err) {
    console.log("not found")
  }
}

server.listen(3000);