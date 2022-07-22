const socket = io('/')
const vidspace = document.querySelector('#records')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const peersconnected = {}

userPeer.on('open', userpeerid => {
    socket.emit('join-room', ROOMID, userpeerid)
})

// making video element
const myvid = document.createElement('video')
// mutes video for the current user
myvid.muted = true


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    videostream(myvid, stream)

    socket.on('user-connected', userID => {
        // delaying the connection so that the responders videostream can load 
        setTimeout(connecttouser, 1000, userID, stream)
    })


    userPeer.on('call', callobj => {
        callobj.answer(stream)
        console.log("you're being called and we're answering for you......")

        const sentvideostream = document.createElement('video')
        callobj.on('stream', receivedvidstream => {
            videostream(sentvideostream, receivedvidstream)
        })
    })

})

socket.on('user-disconnected', userID => {
    console.log(userID + ' left')
    if(peersconnected[userID]) peersconnected[userID].close()
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


function connecttouser(userID, stream) {
    const connecteduservideo = document.createElement('video')

    const call = userPeer.call(userID, stream)
        .on('stream', userVideoStream => {
            videostream(connecteduservideo, userVideoStream)
            console.log('call connected successfully, we are now streaming')
        })
        .on('close', () => {
            console.log('closed')
            setTimeout(connecteduservideo.remove(), 2000)
        })

    console.log(userID + ' connected')
    console.log('Youre calling.....')

    peersconnected[userID] = call
}


