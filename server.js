const express = require('express')
const path = require('path')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid');

app.set("view engine", "ejs");
app.use(express.static('public'))


app.get('/', (req, res) => {
  console.log(__filename)
  res.sendFile(path.join(__dirname, 'views', 'test.html'))
});

app.get('/room', (req, res) => {
  res.redirect(`/room/${uuidV4()}`)
});

app.get('/room/:roomid', (req, res) => {
  // res.send('jo')
  res.render('room', {roomID: req.params.roomid})
})


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