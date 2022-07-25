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

// database
const mongoose = require('mongoose')
const Userdb = require('./userschema')
mongoose.connect("mongodb://localhost/usersdb",() => {console.log('db connected')}, err => console.log(err))

async function insert_user_db(name, email, password, anonymous){
  const inputval = await Userdb.create({
    username: name,
    email: email,
    password: password,
    datejoined: Date.now(),
    tempUser: anonymous
  })
  console.log("added "+inputval+" to db")
}

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


app.get('/', preventnonloggeduser, (req, res) => {
  res.render('index', {name: req.user.name})
});


// Signing routers
const signRouters = require('./routes/signings.js')
app.use('/', signRouters)

// Room routers
const roomRouter = require('./routes/rooms.js');
app.use('/room', roomRouter)


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

server.listen(3000);