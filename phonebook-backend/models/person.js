const mongoose = require("mongoose")
const personSchema =
  new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      minLength: 8,
      validate: {
        validator: function(v) {
          const phoneNumberPattern = /^\d{2,3}-\d+$/
          return phoneNumberPattern.test(v)
        },
        message: props => `${props.value} is not a valid phone number`
      },
      required: true
    }
  })
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // note: document._id is stored as an object (and not string)
    returnedObject.id = document._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Person = mongoose.model("Person", personSchema)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch(error => {
    console.log("Couldn't connect to MongoDB.\n", error)
  })
module.exports = Person
