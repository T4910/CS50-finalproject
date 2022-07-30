console.log(ORGID)
// console.log(ROOMINFO/*.people.map((e) =>{ if(e.id == ORGID){ return e.id}})*/)

let otherusername = ''

const socket = io('/')
const vidspace = document.querySelector('#records')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
    path: '/room'
})
const peersconnected = {}

userPeer.on('open', userpeerid => {
    socket.emit('join-room', ROOMID, userpeerid, ORGNAME)
})

// making video element
const myvid = document.createElement('video')
// mutes video for the current user
myvid.muted = true


navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(stream => {
    videostream(myvid, stream, ORGNAME)

    socket.on('user-connected', (userID, name) => {        
        setTimeout(connecttouser, 1000, userID, stream, ORGNAME)
        // socket.emit("sendName", ORGNAME)
        // connecttouser(userID, stream, name)
    })

    
// socket.on("AddName", (username) => { // Tell other user their name
//     othername = username;
//     console.log(username);
// });

    userPeer.on('call', callobj => {
        callobj.answer(stream)
        socket.emit("sendNAME", ORGNAME)

        console.log("you're being called and we're answering for you......")

        
        const sentvideostream = document.createElement('video')
        callobj.on('stream', receivedvidstream => {
            console.log("callers name"+callobj.metadata.callersname)
            videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
        })

    })

})

socket.on('user-disconnected', userID => {
    console.log(userID + ' left')
    RemoveUnusedDivs()
    if(peersconnected[userID]) peersconnected[userID].close()
})

socket.on('Addname', (othername) => {
    console.log('Addnmae'+othername)
    otherusername = othername
})



// adds video streams
function videostream(video, stream, name){
    video.srcObject = stream
    let div = document.createElement('div')
    let streamname = document.createElement('p')
    let nametext = document.createTextNode(name)
    streamname.appendChild(nametext)
    
    console.log(name)
    div.appendChild(video)
    div.appendChild(streamname)
    // once the video is loaded, play the video automatically
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    vidspace.append(div)
}


function connecttouser(userID, stream, name) {
    const connecteduservideo = document.createElement('video')

    const call = userPeer.call(userID, stream, {metadata: {'callersname': name}})

        call.on('stream', (userVideoStream) => {
            // console.log(userVideoStream.metadata)
                videostream(connecteduservideo, userVideoStream, otherusername)
            console.log('call connected successfully, we are now streaming')
        })
        call.on('close', () => {
            console.log('closed')
            RemoveUnusedDivs()
            connecteduservideo.parentElement.remove()
        })
        // socket.emit('ready')
    console.log(userID + ' connected')
    console.log('Youre calling.....')

    peersconnected[userID] = call
}


function RemoveUnusedDivs(){ // This function is used to remove unused divs whenever if it is there
    alldivs = vidspace.getElementsByTagName("div"); // Get all divs in our video area
    for (var i = 0; i < alldivs.length; i++) { // loop through all the divs
        let connection = alldivs[i].getElementsByTagName("video").length; // Check if there is a video elemnt in each of the div
        console.log(`ps${connection}`)
        if (connection == 0) { 
            console.log('connection remonved')
            alldivs[i].remove() // remove
            // alldivs[i].querySelector('p').remove()
        }
    }
}

