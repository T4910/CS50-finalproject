const mongoose = require('mongoose')

const user = new mongoose.Schema({
    id: mongoose.SchemaTypes.ObjectId,
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
    winteam: {
        winners: [mongoose.SchemaTypes.ObjectId],
        color: String,
        tie: Boolean
    },
    people: [user]
})

module.exports = mongoose.model('Room', Roomschema)