const socket = io('/')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

userPeer.on('open', userpeerid => {
    socket.emit('join-room', ROOMID, userpeerid)

})

socket.on('user-connected', userID => {
    console.log('User connected'+ userID)
})