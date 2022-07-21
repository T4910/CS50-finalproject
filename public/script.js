const socket = io('/')

socket.emit('join-room', ROOMID, 10/*USERID*/)