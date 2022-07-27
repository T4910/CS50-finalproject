const mongoose = require('mongoose')

const Userschema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    datejoined: Date,
    tempUser: Boolean,
    imgPath: String,
    socials:{
        facebook: String,
        linkedin: String,
        instagram: String,
        twitter: String,
        website: String
    },
    description: String,
    wins: Number,
    debates: Array
})

module.exports = mongoose.model('User', Userschema)