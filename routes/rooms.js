const express = require('express')
const router = express.Router()
const { v4: uuidV4 } = require('uuid');

// database
const Roomdb = require('../roomschema')


router.get('/', (req, res) => {
    const roomid = uuidV4()
    insert_room_db(roomid ,req.body.topic, req.body.description, req.body.show_status)
    res.redirect(`/room/${roomid}`)
  });
  
router.get('/:roomid', (req, res) => {
    // res.send('jo')
    res.render('room', {roomID: req.params.roomid})
  })
  
async function insert_room_db(id, topic, desc, status){
  const inputval = await Roomdb.create({
    room_id: id,
    topic: topic,
    description: desc,
    visibility: status,
    timeend: Date.now()
  })

  console.log("added "+inputval+" to db")
}

module.exports = router