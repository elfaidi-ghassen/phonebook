/*
    I tried to use a bit of DBC: Design By Contract
    PRE: Pre-condition
    POST: Post-condition
*/

const mongoose = require("mongoose")
const dbName = "phonbook"

/** 
 * Constructor function: Person
 * Person({name: ..., number..., ...}) => Person object
 */
const Person = mongoose.model("Person", getPersonSchema())


if (process.argv.length === 3) {
    var [_, _, password] = process.argv
    mongoose.connect(connectionString(password, dbName))
    displayPhonebook()
} else if (process.argv.length === 5){
    var [_, _, password, name, number] = process.argv
    mongoose.connect(connectionString(password, dbName))
    addPerson(new Person({name, number}))
} else {
    console.log("Error: Invalid argument count")
    console.log("HINT: node mongo.js [password] (list all records)")
    console.log("HINT: node mongo.js [password] [name] [number] (add a new record)")
    process.exit(1)
}


/**
 * NOTE: the following characters { : / ? # [ ] @ ! $ & ' ( ) * , ; = % }
 *   in passwords will be converted to percent notation
 *   e.g. "abcd:1234" => "abcd%3A1234"
 * connectionString(password: string, dbName: string) => string
 */
function connectionString(password, dbName) {
    return `mongodb+srv://elfaidighassen:${encodeURIComponent(password)}@cluster0.x2vshhk.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`
}


/** 
 * Fetches and prints the records in the phonebook
 */
function displayPhonebook() {
    Person
    .find({})
    .then(persons => {
        displayPersonsList(persons)
        mongoose.connection.close()
    })
}


/** 
 * Prints the list of people in the console
 * displayPersonsList(persons: [{person1}, {person2}, ...])
 * PRE: persons != null
 */
function displayPersonsList(persons) {
    if (persons.length === 0) {
        console.log("Found 0 records in the phonebook")
        return
    }
    for (let person of persons) {
        console.log(person.name, person.number)
    }
}

/** 
 * return a schema for the people collection
 */
function getPersonSchema() {
    return new mongoose.Schema({
        name: String,
        number: String
    })
}

/** 
 * PRE: the argument person must be created by the Person constructor
 * PRE: person.save !== undefined
 * POST: "people" collection contains a document representing the given person
 */
function addPerson(person) {
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
}

