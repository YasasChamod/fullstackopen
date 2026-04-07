const mongoose = require('mongoose')

const phoneNumberPattern = /^\d{2,3}-\d+$/

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Person name is required'],
    minlength: [3, 'Person name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Person number is required'],
    minlength: [8, 'Phone number must be at least 8 characters long'],
    validate: {
      validator: value => phoneNumberPattern.test(value),
      message: 'Phone number format is invalid. Use XX-XXXXXXXX or XXX-XXXXXXXX',
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
