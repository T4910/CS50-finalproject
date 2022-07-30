const mongoose = require('mongoose')

const user = new mongoose.Schema({
    id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    name: String,
    anonymous: Boolean,
    role: String
})

const Roomschema = new mongoose.Schema({
    room_id: String,
    topic: String,
    description: String,
    visibility: String,
    timeend: Date,
    timestarted: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    people: [user],
    winteam: {
        winners: [user],
        color: String,
        tie: Boolean
    }
})

Roomschema.statics.getusersinfo

module.exports = mongoose.model('Room', Roomschema)