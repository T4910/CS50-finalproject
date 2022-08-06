const messageForm = document.querySelector('#messageForm')
const message = document.querySelector('#message-box')
const chatspace = document.querySelector('#chat-space')

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.emit("sendMESSAGE", ORGNAME, message.value, ROOMID); // Emit a send message event and pass chat message with userName
    addtext(chatspace, ORGNAME, message.value)
    message.value = "";
})

socket.on('Addmessage', (name, message) => {
    console.log('it got thorug')
    addtext(chatspace, name, message)
})

function addtext(space, username, usermessage){
    let message_space = document.createElement('div')
    let message_box = document.createElement('p')
    let name_box = document.createElement('small')
    let message_text = document.createTextNode(`${usermessage}`)
    let person_name = document.createTextNode(`${username}`)

    name_box.appendChild(person_name)
    message_box.appendChild(message_text)

    message_space.appendChild(name_box)
    message_space.appendChild(message_box)
    space.appendChild(message_space)
}