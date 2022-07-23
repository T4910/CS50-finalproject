const express = require('express')
const path = require('path')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)



app.set("view engine", "ejs");
app.use(express.static('public'))


app.get('/', (req, res) => {
  console.log(__filename)
  res.render('')
});


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