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
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.get('/', preventnonloggeduser, async (req, res) => {
  let imageextract = await Userdb.findOne({_id: req.user[0]._id})
  res.render('index', {
    name: req.user[0].username, 
    id: req.user[0]._id, 
    date: req.user[0].datejoined, 
    email: req.user[0].email,
    imgPath: imageextract.imgPath
  })
});


// Signing routers
const signRouters = require('./routes/signings.js')
app.use('/', signRouters)

// Room routers
const roomRouter = require('./routes/rooms.js');
app.use('/room', roomRouter)

// UPLOAT profile photo 
app.post('/upload', preventnonloggeduser, async (req, res) => {    

  const updatedoc = await Userdb.findOne({_id : req.user[0]._id})

  upload(req, res, async (err) => {
    console.log(req.file.filename)
    if (updatedoc.imgPath != ''){
      deleteprevimg(updatedoc.imgPath)
    }

    updatedoc.imgPath = req.file.filename
    await updatedoc.save()

    return (err) ? res.send(err) : res.redirect('/')
  })
  
      // resizing and upgrade of photo
     async function resize() {
      // generate random photo id for user
       const imgID = `${uuidV4()}.jpg`;

       // Reading Image
       console.log(__dirname)
       const image = await Jimp.read(`${__dirname}/public/images/${updatedoc.imgPath}`);

       // Used RESIZE_BEZIER as cb for finer images
       image.resize(200, 300, Jimp.RESIZE_BEZIER, function(err){
        console.log('resize')
            if (err) throw err;
         })
         .write(`${__dirname}/public/images/${imgID}`);

         console.log(`delete: ${updatedoc.imgPath}, `)
        deleteprevimg(updatedoc.imgPath)
        updatedoc.imgPath = imgID
        await updatedoc.save()

      }
      resize()
    
})
    

// checks for socket connections in stream rooms
io.on('connection', socket => {
  socket.on('join-room', (roomID, userID) => {
    socket.join(roomID)
    socket.broadcast.to(roomID).emit('user-connected', userID)
    console.log(userID +' connected')

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
    fs.unlinkSync(pathtoimg)
  } catch(err) {
    console.log("not found")
  }
}

server.listen(3000);