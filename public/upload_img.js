window.onload = () => {
let form = document.querySelector("#editform")
let menu = document.querySelector("#companystuff")
let configmenu = document.querySelector("#configmenu")


document.querySelector('#edit')
.addEventListener('click', () => {
    (form.style.display == "none") ? form.style.display = "initial" : form.style.display = "none"
})

document.querySelector("#menu")
.addEventListener('click', () => {
    (menu.style.display == "none") ? menu.style.display = "initial" : menu.style.display = "none"
})

document.querySelector("#showconfigurations")
.addEventListener('click', () => {
    (configmenu.style.display == "none") ? configmenu.style.display = "initial" : configmenu.style.display = "none"
})



async function configure(){
    const responses = await fetch('http://localhost:3000/config', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            public: true
        })
    })
   
    const data = await responses.json()
    console.log(data)
}
}