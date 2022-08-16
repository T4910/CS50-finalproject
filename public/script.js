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
    socket.emit('join-room', ROOMID, userpeerid, ORGID, ORGNAME, ORGROLE, ORGANON)
    console.log('ksdfdsf')
    participants(users_number, ORGNAME, ORGROLE, ORGANON)
})


socket.on('NEWstream', (id, admin_number, othercallers) => {
    othercallers.push(admin_number)
    buildvidstreams(id, true, othercallers)
    console.log(`stream ${id} and ${othercallers} are to be called`)
})

buildvidstreams()

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
})

// update role
socket.on('update-role', (id, role) => {
    updateusersrole(id, role)
})

socket.on('connectionlist', (list, id, profile_id) => {
    console.log(id)
    if (users_number == id){
        console.log('making up participants list that was sent')
        for (let person in list) {
            // console.log(list[person])
            // passing in the wrong values
            console.log('JOEIRDFV')
            participants(list[person].id, list[person].name, list[person].role, list[person].anonymous)
        }
    }
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
// it deals with participants_connected
function participants(id, name, role, anonymous){
    console.log(`forming participant....${name}`)
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

    participants_connected[name] = {id: id, name: name, role: role, anonymous: anonymous}

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
    if (users_number == id){
        ORGROLE = role
        console.log(`updateusersrole ${role}`)
    }    
}

// connects new users to you when a user connects
// deals with peers_connected
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

    // when the call ends, the connections dies leaving an empty video in vidspace
    // so RemoveUnusedDivs removes any video that has stopped or removes the video of 
    // the person that left and if the function fails for some reason, the second function
    // takes care of it
    .on('close', () => {
        console.log(`closed ${id} and ${userID}`)
        // RemoveUnusedDivs(participants_connected[userID].id)
        try{
            connecteduservideo.parentElement.remove()
        } catch(e){console.log('error removing')}
    })

    console.log(userID + ' connected')
    console.log('Youre calling.....')


    peersconnected[userID] = [call, otherpersonid]
    connected_list.push(userID)
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
            document.getElementById(`us${participants_connected[name].id}er`).remove()
        }
    }

    // document.querySelector(`#records div p`).remove()
}


function buildvidstreams(id, another, callees){
    console.log(id, users_number)
    if ((ORGROLE == 'admin' && another != true) || (ORGROLE == 'speaker' && current_vid == true) || (users_number == id && id != undefined)){
        console.warn('streamer')
        // making video element
        const myvid = document.createElement('video')
        myvid.muted = true // mutes video for the current user

        navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(stream => {
            // socket.emit('ready') // sends a ready signal to the server when users video is ready
            console.log('code 1 v=/43]ET')
            videostream(myvid, stream, ORGNAME)

            socket.on('user-connected', (userID, keyname, NAME, ROLE, ANON) => {    
                // connecttouser(userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
                console.log('connected to people...')
                setTimeout(connecttouser, 1000, userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON, keyname)
                if (another != true){
                    socket.emit('send_connection_list', participants_connected, userID)
                }
                console.log('OASOI')
                participants(userID, NAME, ROLE, ANON)
            })
            
            if(another == true){
                for (let connected_ids of callees){
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
                    console.log('code 2 654].TR')
                    videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
                    // participants(callobj.metadata.callersid, callobj.metadata.callersname, callobj.metadata.callersrole, callobj.metadata.callersanon)
                })
            
            })
        })
    } else {
        if(another == true){
            return
        }
        // socket.emit('ready') // sends a ready signal to the server when users video is ready
        console.warn('streaming')

        socket.on('user-connected', (userID, keyname, NAME, ROLE, ANON) => {    
            // connecttouser(userID, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
            console.log('CALLED for a non streamy ...987YUHREJBFNDVI4ER')
            peersconnected[userID] = [{}, keyname]
            connected_list.push(userID)
            if (ORGROLE != 'speaker'){
                console.log('NJKFDRE')
                participants(userID, NAME, ROLE, ANON)
            }
        })

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
                console.log('code 3 ]DS/F')
                videostream(sentvideostream, receivedvidstream, callobj.metadata.callersname)
            })
        
        })
    }
}

