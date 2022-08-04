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



async function configure(){
    const responses = await fetch('http://localhost:3000/changerole', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            public: true,
            roomID: ROOMID,
            person_id: person
        })
    })

    const data = await responses.json()
    console.log(data)
    console.log(participants_connected)
}


