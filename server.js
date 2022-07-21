const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')

app.set("view engine", "ejs");
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
});


app.get('/:room', (req, res) => {
  console.log(req.param.room)
  res.render('room', {roomID: req.param.room})
})

io.on('connection', socket => {
  socket.on('join-room', (roomID, userID) => {
    console.log(roomID, userID)
  })
})

server.listen(3000);