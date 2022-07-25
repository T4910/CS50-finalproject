const mongoose = require('mongoose')

const Userschema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    datejoined: Date,
    tempUser: Boolean
})

module.exports = mongoose.model('User', Userschema)