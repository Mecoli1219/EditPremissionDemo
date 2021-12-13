import mongoose from "mongoose"

const Schema = mongoose.Schema
const FrameSchema = new Schema({
    start: {
        type: Number,
        required: [true, 'Start field is required.']
    },
    data: {
        type: String,
        default: ""
    },
    editing: {
        type: Boolean,
        required: [true, 'Editing field is required']
    }
})

const Frame = mongoose.model('frame', FrameSchema)
export default Frame

