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

async function usernametaken(name){
  const namecheck = await Userdb.find({ username: name })
  if(namecheck.length != 0){
    return true
  }

  return false
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


app.get('/', checkauth, (req, res) => {
  res.render('index', {name: req.user.name})
});


// Signing routers
app.route('/login', checknotauth)
.get((req, res) => {
  res.render('login')
})
.post(passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.route('/register', checknotauth)
.get((req, res) => {
  res.render('register')
})
.post( async (req, res) => {
  
  // validations
  if(!(req.body.username))
  {
    req.flash('no_username', 'Require username')
    res.redirect('/register')
    return
  }
  else if(!(req.body.email))
  {
    req.flash('no_email', 'Require email')
    res.redirect('/register')
    return
  }
  else if(!(req.body.password))
  {
    req.flash('no_password', 'Require password')
    res.redirect('/register')
    return
  }
  else if(usernametaken(req.body.username))
  {
    req.flash('usertaken', 'Username taken')
    res.redirect('/register')
    return
  }

  try{
    const hashed_password = await bcrypt.hash(req.body.password, 10)
    const datainputs = {
      name: req.body.username,
      email: req.body.email,
      password: hashed_password
    }

    insert_user_db(datainputs.name, datainputs.email, datainputs.password, false)
    res.redirect('/login')

  } catch (err) {
    res.redirect('/register')
    console.log(err)
  }
})

app.route('/anonymous', checknotauth)
.get((req, res) => {
  res.render('anonymous')
})
.post((req, res) => {
  res.redirect('/')
})

app.post('/logout', (req, res) => {
  // don't forget to kill session
  req.logout(err => {
    if (err) { next(err); }
    res.redirect('/login');
  });
})


// const signRouters = require('./routes/signings.js')
// app.use('/', signRouters)

// room routers
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
function checkauth(req, res, next){
  if(req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

// middleware function that prevents logged in users from logging out through get requests
function checknotauth(req, res, next){
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }

  next()
}

server.listen(3000);