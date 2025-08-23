let { phonebook } = require("../data.js")
// NOTE: I tried to apply design by contract
// - PRE => pre-condition, what the function expects
// - POST => post-condition, what the function promises to do
// - INV => invariant, functions expect the invariant to be true
//            and will make sure it will stay true after they execute

/**
 * Module Invariants
 * INV: phonebook must be javascript array 
 *      containing object representing people
 * INV: phonebook !== null && phonebook !== undefined 
 * NOTE: empty array [] represents there are no people records
 */


/**
 * POST: phonebook sent as a JSON string
 * POST: the response has Content-Type: application/json 
 */
function onGetAllRequest(request, response) {
    response.json(phonebook)
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
function onGetPersonRequest(request, response) {
    const id = request.params.id // string
    let personData = phonebook.find(person => person.id == id)
    if (!personData) {
        response.statusMessage = `no person with id ${id}`
        return response.status(404).end()
    }
    response.json(personData).end()
}
 
/**
 * If the request's id is not found, respond with 404 not found error
 * Otherwise, if the person id exists, remove we remove the person
 * from the phonebook, and respond with 204 status code
 * POST: [if id does not exist] response.statusMessage must contain a message explaining the error
 *      NOTE: the status message appears in the response after the status code
 * POST: [if id exists] response with status code 204 (i.e. No Content)
 * POST: [if id exists] phonebook.length decremented by one
*/
function onDeleteRequest(request, response) {
    const id = request.params.id // string
    if (!peopleIds().includes(id)) {
        response.statusMessage = `no person with id ${id}`
        return response.status(404).end()
    }
    phonebook = phonebook.filter(person => person.id !== id)
    response.status(204).end()
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
function onAddPerson(request, response) {
    let person = request.body
    if (!isValidString(person.name) || !isValidString(person.number)) {
        response.status(400)
        return response.json({error: "invalid person object"})
                .end()
    }
    if (phonebook.map(person => person.name).includes(person.name)) {
        response.status(400)
        return response.json({error: "name must be unique"})
            .end()

    }

    const newPerson = {...person, id: String(generatedId())}
    phonebook = phonebook.concat(newPerson)
    response.status(201)
    response.json(newPerson).end()
}

/**
 * isValidString(value: anything) => boolean
 * return true if typeof(value) == "string" 
 */
function isValidString(value) {
    return typeof value == "string" && value.trim().length != 0
}


/**
 * generatedId([max]) => integer [> 0]
 * NOTE: the produced ID is NOT universally unique, conflicts can happen
 */
function generatedId(max= 100_000_000_000) {
    return Math.floor(Math.random() * max)
}

/**
 * Return an array of shallow copies of person objects in the phonebook
 * getPhonebookCopy() => [{person1_copy}, {person2_copy} ...]
 * POST: modifiying nest objects/arrays (if any) in a person object 
 *       WILL modify the original object
 */
function getPhonebookCopy() {
    return phonebook.map(person => {return {...person}})
}

/**
 * peopleIds() => [string, string, ...]
 * returns a list of ids of the people in the phonebook
 * PRE: the people's object should be well formed 
 */
function peopleIds() {
    return phonebook.map(person => person.id)
}

module.exports = { 
    onGetAllRequest,
    onGetPersonRequest,
    onDeleteRequest,
    onAddPerson,
    getPhonebookCopy }