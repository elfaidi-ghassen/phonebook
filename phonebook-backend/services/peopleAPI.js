// NOTE: I tried to apply design by contract
// - PRE => pre-condition, what the function expects
// - POST => post-condition, what the function promises to do
// - INV => invariant, functions expect the invariant to be true
//            and will make sure it will stay true after they execute
let Person = require("../models/person")


/**
 * Module Invariants
 * INV: phonebook must be javascript array 
 *      conta ining object representing people
 * INV: phonebook !== null && phonebook !== undefined 
 * NOTE: empty array [] represents there are no people records
 */


/**
 * POST: phonebook sent as a JSON string
 * POST: the response has Content-Type: application/json 
 */
function onGetAllRequest(request, response) {
    Person
    .find({})
    .then(phonebook => {
        response.json(phonebook)
    })
}
function getAllPromise() {
    return Person.find({})
}


/**
 * If the request's id is not found, respond with 404 not found error
 * Otherwise, send a JSON object equivalent to the person's object
 * PRE: request.params.id is defined
 * POST: [if id exists] response.get("Content-Type")
 *            .includes("application/json") === true
 * POST: [if id does not exist] response.statusMessage must contain a message explaining the error
 *      NOTE: the status message appears in the response after the status code
 */
function onGetPersonRequest(request, response, next) {
    Person
    .findById(request.params.id)
    .then(person => { 
        if (!person) {
            response.statusMessage = `no person with id ${request.params.id}`
            response.status(404).end()
        } else {
            response.json(person).end()
    }}).catch(error => {
        next(error)
    })
}

/**
 * onPutPerson
 */
function onPutPerson(request, response, next) {
    const id = request.params.id
    const {name, number} = request.body
    Person
    .findById(id)
    .then(person => {
        if (!person)
            return response
                    .status(404)
                    .json({error: `Error: person with id ${id} not found`})
                    .end()
        person.name = name;
        person.number = number
        return person.save()
    })
    .then(newPerson => response.json(newPerson).end())
    .catch(next)
}
 
/**
 * If the request's id is not found, respond with 404 not found error
 * Otherwise, if the person id exists, remove we remove the person
 * from the phonebook, and respond with 204 status code
 * POST: [if id does not exist] || [if id exists]
 *           respond with status code 204 (i.e. No Content)
 * POST: [if id exists] phonebook.length decremented by one
*/
function onDeleteRequest(request, response, next) {
    const id = request.params.id // string
    Person
    .findByIdAndDelete(id)
    .then(deletedPerson => {
        response.status(204).end()
    })
    .catch(next) 
}

/**
 * PRE: request.method === "POST"
 * PRE: request.body !== undefined (i.e. use express.json() middleware)
 * PRE: request.body must contain name and phone
 * NOTE: [if no error] if request.body.id exists, it will be ignore
 * POST: [if created] a random id is generated && array.length incremented by one
 *      && the new person object is sent in the response (as JSON)
 * POST: [if created] response.get("Content-Type")
 *            .includes("application/json") === true
 * POST: [if the name or phone number has invalid format] OR
 *       [if name already exists]
 *       send a response header with 400 status code (aka "Bad Request") 
 * POST: [if the name or phone number has invalid format] OR
 *       [if name already exists]
 *       send an object that explains the error 
 *          {"error": "...error message..."}
*/
function onAddPerson(request, response, next) {
    let {name, number} = request.body
    Person
    .find({})
    .then(phonebook => {
        if (alreadyUsedName(phonebook, name))
            throw createValidationError("Error: person name already exists in the phonebook")
    })
    .then(() => Person({name, number}).save())
    .then(savedPerson => {
        response
        .status(201)
        .json(savedPerson)
        .end()
    })       
    .catch(
        error => {
            next(error)
        }
        ) 
}

/**
 * createValidationError(string) => Error 
*/
function createValidationError(message) {
    let error = new Error(message)
    error.name = "ValidationError"
    return error
}

/**
 * alreadyUsedName(phonebook: [{person}, ...], name: string) 
 *              => boolean
 */
function alreadyUsedName(phonebook, name) {
    return phonebook
          .map(person => person.name)
          .includes(name)
}



module.exports = { 
    onGetAllRequest,
    onGetPersonRequest,
    onDeleteRequest,
    onAddPerson,
    onPutPerson,
    getAllPromise } 