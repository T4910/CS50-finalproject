const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')

// database
const Userdb = require('../userschema')


// Signing routers
router.route('/login', preventloggeduser)
.get((req, res) => {
  res.render('login')
})
.post(passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.route('/register', preventloggeduser)
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
  
  if(await usernametaken(req.body.username))
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

router.route('/anonymous', preventloggeduser)
.get((req, res) => {
  res.render('anonymous')
})
.post((req, res) => {
  res.redirect('/')
})

router.route('/logout')
.get(preventloggeduser)
.post((req, res) => {
  req.logout(err => {
    if (err) { next(err); }
    res.redirect('/login');
  })
})


// middleware function that prevents logged in users from logging out through get requests
function preventloggeduser(req, res, next){
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }

  next()
}

// return true if a username is taken
async function usernametaken(name){
  const namecheck = await Userdb.find({ username: name })
  if(namecheck.length != 0){
    return true
  }

  return false
}

async function insert_user_db(name, email, password, anonymous){
  const inputval = await Userdb.create({
    username: name,
    email: email,
    password: password,
    datejoined: Date.now(),
    tempUser: anonymous,
    imgPath: ''
  })
  console.log("added "+inputval+" to db")
}


module.exports = router