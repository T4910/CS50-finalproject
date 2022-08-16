async function change_profile_func(elem, name){  

    if(participants_connected[name].id == undefined){
        return
    }

    console.log(document.querySelector(`div#us${participants_connected[name].id}er select#show_roles`).value)

    const responses = await fetch('http://localhost:3000/changerole', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            roomID: ROOMID,
            person_id: peersconnected[participants_connected[name].id][1],
            call_id: participants_connected[name].id,
            new_role: document.querySelector(`div#us${participants_connected[name].id}er select#show_roles`).value
        })
    })

    const data = await responses.json()
    console.log(data)

    console.log(name)
}


function show_video_func(element, person_name, stream){
    console.log(person_name)
    const person_to_streamer = participants_connected[person_name].id
    sent_connected_list = []
    
    connected_list.forEach((e) => {
        if (e.toString() != person_to_streamer.toString()){
            console.log()
            console.log('IOUHEG4', person_to_streamer.toString(),  e.toString())
            sent_connected_list.push(e)
            console.log(`was added ${e}`)
        }
    })

    console.log(person_to_streamer, users_number, sent_connected_list)
    socket.emit('new-stream', person_to_streamer, users_number, sent_connected_list)
    // connecttouser(participants_connected[person_name].id, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
}

function end_video_func(element, person_name, stream){
    console.log('47 worked')
    // connecttouser(participants_connected[person_name].id, stream, ORGNAME, ORGID, ORGROLE, ORGANON)
}

