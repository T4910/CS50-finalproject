// connected user
let otherusername = ''
let otheruserID = ''
let otheruserrole = ''
let otheruseranon = ''

let current_vid = true
let users_number;


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
// call numbers
let connected_list = []
// people joined
let participants_connected = {}

userPeer.on('open', userpeerid => {
    users_number = userpeerid
    socket.emit('join-room', ROOMID, userpeerid, ORGID)
})


socket.on('NEWstream', (id, admin_number, othercallers) => {
    othercallers.push(admin_number)
    buildvidstreams(id, true, othercallers)
    console.log(`stream ${id} and ${othercallers} are to be called`)
})

buildvidstreams()
participants(ORGID, ORGNAME, ORGROLE, ORGANON)


// disconnects the users and removes the video from the users vidspace
socket.on('user-disconnected', (userID, name) => {
    console.log(name)
    console.log(userID + ' left')
    RemoveUnusedDivs(userID, name)
    if(peersconnected[userID]) peersconnected[userID][0].close()
})

// put the name of person that anwsers the call into othername
socket.on('Addname', (othername, otherID, otherrole, otheranon) => {
    otherusername = othername
    otheruserID = otherID
    otheruserrole = otherrole
    otheruseranon = otheranon
    participants(otheruserID, otherusername, otheruserrole, otheruseranon)
})

// update role
socket.on('update-role', (id, role) => {
    updateusersrole(id, role)
})

// update role
// socket.on('newlist', (the_list, nextlist) => {
//     peersconnected = nextlist
// })


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
    let show_video = document.createElement('button')
    let end_show_video = document.createElement('button')
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
    show_video.setAttribute('onclick', `show_video_func(this, '${name}')`)
    end_show_video.setAttribute('onclick', `end_video_func(this, '${name}')`)
    list_div.setAttribute('id', `us${id}er`)

    let btntext = document.createTextNode('View profile')
    let btnrole = document.createTextNode('Change role')
    let videobtn = document.createTextNode('start Video')
    let endvideobtn = document.createTextNode('end Video')
    let nametext = document.createTextNode(name)
    let roletext = document.createTextNode(role)

    participants_connected[name] = id

    show_video.appendChild(videobtn)
    end_show_video.appendChild(endvideobtn)
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
        list_div.appendChild(show_video)
        list_div.appendChild(end_show_video)
    }


    li.append(list_div)
    participants_list.append(li)
}

function updateusersrole(id, role){
    document.querySelector(`#us${id}er`).querySelector('#userroles').innerHTML = `${role}`
    if (ORGID == id){
        ORGROLE = role
        console.log(`updateusersrole ${role}`)
    }    
}


// connects new users to you when a user connects
function connecttouser(userID, stream, name, id, role, anonymous, otherpersonid) {
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

    // 11/8/2022 commented everything below because we do not need to get a stream back 
    // from another streamer because we already have their stream on our vidspace

    /*
        .on('stream', (userVideoStream) => {
            console.log(`Got to straeaming from another streamer`)
                videostream(connecteduservideo, userVideoStream, otherusername)
                // participants(otheruserID, otherusername, otheruserrole, otheruseranon)
            console.log('call connected successfully, we are now streaming')
        })
    */

    // when the call ends, the connections dies leaving an empty video in vidspace
    // so RemoveUnusedDivs removes any video that has stopped or removes the video of 
    // the person that left and if the function fails for some reason, the second function
    // takes care of it
    .on('close', () => {
        console.log('closed')
        connecteduservideo.parentElement.remove()
        RemoveUnusedDivs(participants_connected[userID])
    })

    console.log(userID + ' connected')
    console.log('Youre calling.....')


    peersconnected[userID] = [call, otherpersonid]
    connected_list.push(userID)

    let listedpeers = []
    for (item in peersconnected){
        console.log(item)
        listedpeers.push(item)
    }
    socket.emit('newconnectedlist', listedpeers)
}


function RemoveUnusedDivs(id, name){ // This function is used to remove unused divs whenever if it is there
    alldivs = vidspace.getElementsByTagName("div"); // Get all divs in our video area
    for (var i = 0; i < alldivs.length; i++) { // loop through all the divs
        let connection = alldivs[i].getElementsByTagName("video").length; // Check if there is a video elemnt in each of the div
        let vidname = alldivs[i].querySelector(`p`).innerHTML
        console.log(vidname)
        if (connection == 0 || vidname == name) {
            console.log('connection remonved')
            alldivs[i].remove() // remove
            document.getElementById(`us${participants_connected[name]}er`).remove()
        }
    }

    // document.querySelector(`#records div p`).remove()
}


function buildvidstreams(id, another, callees){
    if ((ORGROLE == 'admin' && another != true) || (ORGROLE == 'speaker' && current_vid == true) || ORGID == id){
        console.warn('streamer')
        // making video element
        const myvid = document.createElement('video')
        myvid.muted = true // mutes video for the current user

        navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(stream => {
            // socket.emit('ready') // sends a ready signal to the server when users video is ready
            videostream(myvid, stream, ORGNAME)

            socket.on('user-connected', (userID, name) => {    
                // connecttouser(userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
                console.log('connected to people...')
                setTimeout(connecttouser, 1000, userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON, name)
            })
            
            if(another == true){
                for (connected_ids of callees){
                    console.log(connected_ids)
                    setTimeout(connecttouser, 1000, connected_ids, stream, ORGNAME, ORGID, ORGROLE, ORGANON, null)
                }
            }

            // if another person calls on the screen
            userPeer.on('call', callobj => {
                callobj.answer(stream) //STREAM
                // sends your name to the caller
                console.log(`Your name: ${ORGNAME}, Your id: ${ORGID}`)
                socket.emit("sendNAME", ORGNAME, ORGID, ORGROLE, ORGANON)
            
                console.log("you're being called and we're answering for you ANOTHER STREAMER..DFFDGGHX....")
            
                const sentvideostream = document.createElement('video')
                // gets stream and name of the caller then adds it to vidspace 
                callobj.on('stream', receivedvidstream => {
                    console.log("callers name"+callobj.metadata.callersname)
                    videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
                })
            
            })
        })
    } else {
        // socket.emit('ready') // sends a ready signal to the server when users video is ready
        console.warn('streaming')

        // socket.on('user-connected', (userID, name) => {    
        //     // connecttouser(userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
        //     setTimeout(connecttouser, 1000, userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON, name)
        // })

        userPeer.on('call', callobj => {
            callobj.answer() //STREAM
            // sends your name to the caller
            console.log(`Your name: ${ORGNAME}, Your id: ${ORGID}`)
            socket.emit("sendNAME", ORGNAME, ORGID, ORGROLE, ORGANON)
        
            console.log("you're being called and we're answering for you a STREAMME......")
        
            const sentvideostream = document.createElement('video')
        
            // gets stream and name of the caller then adds it to vidspace 
            callobj.on('stream', receivedvidstream => {
                console.log("callers name"+callobj.metadata.callersname)
                videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
            })
        
        })
    }
}

