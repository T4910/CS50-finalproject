const express = require('express')
const path = require('path')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)



app.set("view engine", "ejs");
app.use(express.static('public'))


app.get('/', (req, res) => {
  res.render('profile')
});


// Signing routers
app.route('/login')
.get((req, res) => {
  res.render('login')
})
.post((req, res) => {
  res.redirect('/')
})

app.route('/register')
.get((req, res) => {
  res.render('register')
})
.post((req, res) => {
  res.redirect('/')
})

app.route('/anonymous')
.get((req, res) => {
  res.render('anonymous')
})
.post((req, res) => {
  res.redirect('/')
})

app.get('/logout', (req, res) => {
  // don't forget to kill session
  res.redirect('/login')
})



// room routers
const roomRouter = require('./routes/rooms.js')
app.use('/room', roomRouter)


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

server.listen(3000);