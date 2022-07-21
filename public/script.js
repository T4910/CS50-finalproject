const socket = io('/')
const vidspace = document.querySelector('#records')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const peersconnected = {}

// making video element
const myvid = document.createElement('video')
// mutes video for the current user
myvid.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videostream(myvid, stream)

    userPeer.on('call', call => {
        call.answer(stream)
        const sentvideostream = document.createElement('video')
        call.on('stream', receivedvidstream => {
            videostream(sentvideostream, receivedvidstream)
        })
    })

    socket.on('user-connected', userID => {
        connecttousers(userID, stream)
    })
})

socket.on('user-disconnected', userID => {
    if(peers[userID]){
        peers[userID].close()
    }
})

userPeer.on('open', userpeerid => {
    socket.emit('join-room', ROOMID, userpeerid)
})

socket.on('user-connected', userID => {
    console.log('User connected'+ userID)
})

// adds video streams
function videostream(video, stream){
    video.srcObject = stream
    // once the video is loaded, play the video automatically
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    vidspace.append(video)
}

function connecttouser(userID, stream){
    const call = userPeer.call(userID, stream)
    const connecteduservideo = document.createElement('video')
    call.on('stream', userVideostream => {
        videostream(connecteduservideo, userVideostream)
    })
    call.on('close', () => {
        connecteduservideo.remove()
    })

    peersconnected[userID] = call
}