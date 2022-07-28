const express = require('express')
const router = express.Router()
const { v4: uuidV4 } = require('uuid');

// database
const Roomdb = require('../roomschema')


router.get('/',preventnonloggeduser, async (req, res) => {
    const roomid = uuidV4()
    console.log(`${req.user[0]._id} From roon route`)
    if(req.query.role == 'admin'){
      await insert_room_db(roomid, req.query.topic, req.query.description, req.query.status)
      await add_people(req.user[0]._id, req.user[0].name, req.user[0].tempUser, 'admin', roomid)
      res.redirect(`/room/${roomid}`)
      return
    } 
      
    await add_people(req.user[0]._id, req.user[0].name, req.user[0].tempUser, 'basic', req.query.ROOMID)
    res.redirect(`/room/${req.query.ROOMID}`)
    
});

  
router.get('/:roomid', preventnonloggeduser, async (req, res) => {
  console.log(`${req.user[0]._id} From roon route`)

    res.render('room', {roomID: req.params.roomid, orguserID: req.user[0]._id})
})
  

async function insert_room_db(id, topic, desc, status){
  const inputval = await Roomdb.create({
    room_id: id,
    topic: topic,
    description: desc,
    visibility: status,
    timeend: Date.now()
  })

  console.log("made room db")
}

async function add_people(personid, name, anonymous, role, room){
  const person = await Roomdb.findOne({room_id: room})

  let x = person.people.map((value) => {
    if (value.id == personid){
      return value.id
    }
  })

// console.log(`starting section of ${x} array for each id`)

  // if(person.people.id == personid){
      person.people.push({
        id: personid, 
        name: name, 
        anonymous: anonymous, 
        role: role
      })
    await person.save()
  // }
  console.log("Show new people array"+ person.people +"in the room db")
}


function preventnonloggeduser(req, res, next){
  if(req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}


module.exports = router