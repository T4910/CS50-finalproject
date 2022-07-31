console.log(ORGID)

// connected user
let otherusername = ''

const socket = io('/')
const vidspace = document.querySelector('#records')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
    path: '/room'
})

// stores all connected calls
let peersconnected = {}

userPeer.on('open', userpeerid => {
    socket.emit('join-room', ROOMID, userpeerid, ORGNAME)
})

// making video element
const myvid = document.createElement('video')
// mutes video for the current user
myvid.muted = true


navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(stream => {

    socket.emit('ready') // sends a ready signal to the server when users video is ready
    videostream(myvid, stream, ORGNAME)

    socket.on('user-connected', (userID, name) => {        
        connecttouser(userID, stream, ORGNAME)
    })

    userPeer.on('call', callobj => {
        callobj.answer(stream)
        // sends your name to the caller
        socket.emit("sendNAME", ORGNAME)

        console.log("you're being called and we're answering for you......")

        const sentvideostream = document.createElement('video')

        // gets stream and name of the caller then adds it to vidspace 
        callobj.on('stream', receivedvidstream => {
            console.log("callers name"+callobj.metadata.callersname)
            videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
        })

    })

})

// disconnects the users and removes the video from the users vidspace
socket.on('user-disconnected', (userID, name) => {
    console.log(userID + ' left')
    if(peersconnected[userID]) peersconnected[userID].close()
    RemoveUnusedDivs(name)
})

// put the name of person that anwsers the call into othername
socket.on('Addname', (othername) => {
    console.log('Addnmae'+othername)
    otherusername = othername
})



// adds other people's video streams to yours
function videostream(video, stream, name){
    video.srcObject = stream
    let div = document.createElement('div')
    let streamname = document.createElement('p')
    let nametext = document.createTextNode(name)
    streamname.appendChild(nametext)
        div.appendChild(video)
    div.appendChild(streamname)
    // once the video is loaded, play the video automatically
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    vidspace.append(div)
}


// connects new users to you when a user connects
function connecttouser(userID, stream, name) {
    const connecteduservideo = document.createElement('video')

    // calls the person that connected and sends your name
    const call = userPeer.call(userID, stream, {metadata: {'callersname': name}})

        // when we get the stream event on the peer object it gets the users stream and
        // adds it to your own stream box (vidspace)
        call.on('stream', (userVideoStream) => {
            // console.log(userVideoStream.metadata)
                videostream(connecteduservideo, userVideoStream, otherusername)
            console.log('call connected successfully, we are now streaming')
        })

        // when the call ends, the connections dies leaving an empty video in vidspace
        // so RemoveUnusedDivs removes any video that has stopped or removes the video of 
        // the person that left and if the function fails for some reason, the second function
        // takes care of it
        call.on('close', () => {
            console.log('closed')
            RemoveUnusedDivs()
            connecteduservideo.parentElement.remove()
        })
    console.log(userID + ' connected')
    console.log('Youre calling.....')

    peersconnected[userID] = call
}


function RemoveUnusedDivs(name){ // This function is used to remove unused divs whenever if it is there
    alldivs = vidspace.getElementsByTagName("div"); // Get all divs in our video area
    for (var i = 0; i < alldivs.length; i++) { // loop through all the divs
        let connection = alldivs[i].getElementsByTagName("video").length; // Check if there is a video elemnt in each of the div
        let leavingusername = alldivs[i].querySelector('p').innerHTML;
        console.log(`ps${leavingusername}`)
        if (connection == 0 || leavingusername == name) {
            console.log('connection remonved')
            alldivs[i].remove() // remove
        }
    }
}

