const { required } = require('joi')
const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema ({
title:{
type: String,
required : [true, 'Please provide Title'],
maxlength : 50,
},
author:{
type:String,
required: [true, 'Please Provide Author'],
maxlength : 100,
},
status:{
type:String,
enum: ['available', 'onhold', 'checkedout'],
default: 'available',
},
createdBy: {
type: mongoose.Types.ObjectId,
ref: 'User',
required:[true, 'Please provide User'],
}
},{timestamps:true})

module.exports = mongoose.model('Book', bookSchema)