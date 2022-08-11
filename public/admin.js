async function change_profile_func(elem, name){  

    if(participants_connected[name] == undefined){
        return
    }

    console.log(document.querySelector(`div#us${participants_connected[name]}er select#show_roles`).value)

    const responses = await fetch('http://localhost:3000/changerole', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            roomID: ROOMID,
            person_id: participants_connected[name],
            new_role: document.querySelector(`div#us${participants_connected[name]}er select#show_roles`).value
        })
    })

    const data = await responses.json()
    console.log(data)

    console.log(name)
}


function show_video_func(element, person_name, stream){
    const person_to_streamer = participants_connected[person_name]
    sent_connected_list = []
    
    connected_list.forEach((e) => {
        console.log(`in connecteed list${e}`)
        if (peersconnected[e][1] != person_to_streamer.toString()){
            console.log( person_to_streamer.toString(),  peersconnected[e][1])
            sent_connected_list.push(e)
            console.log(`wasn't added ${e}`)
        }
    })

    socket.emit('new-stream', person_to_streamer, users_number, sent_connected_list)
    // connecttouser(participants_connected[person_name], stream, ORGNAME, ORGID, ORGROLE, ORGANON)
}

function end_video_func(element, person_name, stream){
    console.log('47 worked')
    // connecttouser(participants_connected[person_name], stream, ORGNAME, ORGID, ORGROLE, ORGANON)
}

