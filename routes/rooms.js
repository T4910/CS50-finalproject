const express = require('express')
const router = express.Router()
const { v4: uuidV4 } = require('uuid');


router.get('/', (req, res) => {
    res.redirect(`/room/${uuidV4()}`)
  });
  
router.get('/:roomid', (req, res) => {
    // res.send('jo')
    res.render('room', {roomID: req.params.roomid})
  })
  
  module.exports = router