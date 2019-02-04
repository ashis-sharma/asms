const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    smsSent:{
        type:Number,
        default:0
    },
    emailSent:{
        type:Number,
        default:0
    },
    date:{
        type:Date,
        default:Date.now
    }

})

const User = mongoose.model('User',UserSchema);

module.exports = User;