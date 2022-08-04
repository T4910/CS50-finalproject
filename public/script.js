// const userinfo = JSON.parse(ALLUSERINFO)
// console.log(userinfo)

// connected user
let otherusername = ''
let otheruserID = ''
let otheruserrole = ''
let otheruseranon = ''


const socket = io('/')
const vidspace = document.querySelector('#records')
const participants_list = document.querySelector('#p_list')
const userPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
    path: '/room'
})

// stores all connected calls
let peersconnected = {}
// people joined
let participants_connected = {}

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
    participants(ORGID, ORGNAME, ORGROLE, ORGANON)

    socket.on('user-connected', (userID, name) => {        
        connecttouser(userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
    })

    userPeer.on('call', callobj => {
        callobj.answer(stream)
        // sends your name to the caller
        console.log(`Your name: ${ORGNAME}, Your id: ${ORGID}`)
        socket.emit("sendNAME", ORGNAME, ORGID, ORGROLE, ORGANON)

        console.log("you're being called and we're answering for you......")

        const sentvideostream = document.createElement('video')

        // gets stream and name of the caller then adds it to vidspace 
        callobj.on('stream', receivedvidstream => {
            console.log("callers name"+callobj.metadata.callersname)
            videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
            participants(callobj.metadata.callersid, callobj.metadata.callersname, callobj.metadata.callersrole, callobj.metadata.callersanon)
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
socket.on('Addname', (othername, otherID, otherrole, otheranon) => {
    console.log('Addnmae'+othername)
    otherusername = othername
    otheruserID = otherID
    otheruserrole = otherrole
    otheruseranon = otheranon
})

// update role
socket.on('update-role', (id, role) => {
    updateusersrole(id, role)
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

// Adds connected users to the list
function participants(id, name, role, anonymous){
    let li = document.createElement('li')
    let list_div = document.createElement('div')

    let selectrole = document.createElement('select')
    let view_profile = document.createElement('button')
    let change_role = document.createElement('button')
    let username = document.createElement('p')
    let userrole = document.createElement('p')

    let roles = ['speaker', 'judge', 'admin', 'audience']

    for(let i = 0; i < roles.length; i++){
        let optionrole = document.createElement('option')
        let speakrole = document.createTextNode(roles[i])
        optionrole.setAttribute('value', roles[i])

        optionrole.append(speakrole)
        selectrole.appendChild(optionrole)
    }


    userrole.setAttribute('id', 'userroles')
    view_profile.setAttribute('id', 'show_profile')
    selectrole.setAttribute('id', 'show_roles')
    change_role.setAttribute('onclick', `change_profile_func(this, '${name}')`)
    list_div.setAttribute('id', `us${id}er`)

    let btntext = document.createTextNode('View profile')
    let btnrole = document.createTextNode('Change role')
    let nametext = document.createTextNode(name)
    let roletext = document.createTextNode(role)

    console.log(role)

    participants_connected[name] = id

    view_profile.appendChild(btntext)
    change_role.appendChild(btnrole)
    username.appendChild(nametext)
    userrole.appendChild(roletext)
    
    list_div.appendChild(username)
    list_div.appendChild(userrole)
    if (anonymous == 'false'){
        list_div.appendChild(view_profile)
    }
    if (ORGROLE == 'admin'){
        list_div.appendChild(change_role)
        list_div.appendChild(selectrole)
    }


    li.append(list_div)
    participants_list.append(li)
}

function updateusersrole(id, role){
    if (ORGID == id){
        // let roles = ['admin', 'judge', 'speaker', 'audience'];

        // for(let therole of roles){
        //     if (ORGROLE == role){
        //         document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${therole}`
        //         ORGROLE = therole
        //         console.log(`updateusersrole ${therole}`)
        //     }
        // }


        if (ORGROLE == 'admin'){
            document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${role}`
            ORGROLE = role
            console.log('updateusersrole admin')
            return
        }
        else if (ORGROLE == 'judge'){
            document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${role}`
            ORGROLE = role
            console.log('updateusersrole judge')
            return

        }
        else if (ORGROLE == 'speaker'){
            document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${role}`
            ORGROLE = role
            console.log('updateusersrole speaker')
            return

        }
        else if (ORGROLE == 'audience'){
            document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${role}`
            ORGROLE = role
            console.log('updateusersrole audience')
            return
        } 
    }
    // document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${role}`
    console.log(`${role}`)
}



// connects new users to you when a user connects
function connecttouser(userID, stream, name, id, role, anonymous) {
    const connecteduservideo = document.createElement('video')

    // calls the person that connected and sends your name
    const call = userPeer.call(userID, stream, {
        metadata: {
            'callersname': name, 
            'callersid': id, 
            'callersrole': role, 
            'callersanon': anonymous
        }
    })

        // when we get the stream event on the peer object it gets the users stream and
        // adds it to your own stream box (vidspace)
        call.on('stream', (userVideoStream) => {
            // console.log(userVideoStream.metadata)
                videostream(connecteduservideo, userVideoStream, otherusername)
                participants(otheruserID, otherusername, otheruserrole, otheruseranon)
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

