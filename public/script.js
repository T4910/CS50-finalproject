const socket = io('/')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

socket.emit('join-room', ROOMID, 10/*USERID*/)

socket.on('user-connected', userID => {
    console.log('User connected'+ userID)
})