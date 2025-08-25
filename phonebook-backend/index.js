require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const peopleAPI = require("./services/peopleAPI.js")
const app = express()


app.use(express.static("dist"))
app.use(express.json())

// define a new token, than can be used later with tokens.body
morgan.token('body', getRequestBody)
app.use(morgan(customMorganFormat))


 
/** 
 * API DETAILS
 * [GET /api/persons] the list of all people in the phonebook
 *   --> [{person1}, {person2}, ...]
 * [GET /api/persons/:id] get a specific person using their id
 * [DELETE /api/persons/:id] delete a specific person using their id
 * [POST /api/persons] create a new person, the person object must be in the request body
*/


app.get("/api/persons", peopleAPI.onGetAllRequest)
app.get("/api/persons/:id", peopleAPI.onGetPersonRequest)
app.delete("/api/persons/:id", peopleAPI.onDeleteRequest)
app.post("/api/persons", peopleAPI.onAddPerson)
app.put("/api/persons/:id", peopleAPI.onPutPerson)
app.get("/info", onGetInfoPage)

app.use(unknownEndpoint)
app.use(errorHandler)


/* Start the server */
const PORT = process.env.PORT || 3001 
app.listen(PORT, onServerStart)

 
function onServerStart() {
    console.log(`The server is running on port ${PORT}...`)
}





// custom middlewares
function unknownEndpoint(request, response, next) {
    response.status(404).send({error: "unkown endpoint"})
}
function errorHandler(error, request, response, next) {
    if (error.name === "CastError") {
        return response.status(400).send({ "error": "malformatted id" })
    }  

    if (error.name === "ValidationError") {
        return response.status(400).send({ "error": error.message })
    }
    next(error) // pass to the default error handler
}






/**
 * PRE: 
 * POST: respond with HTML string
 * POST: response.get("Content-Type")
 *          .includes("text/html") === true  
 */
function onGetInfoPage(request, response) {
    peopleAPI
    .getAllPromise()
    .then(phonebook => {
        const HTMLresponse = createInfoPageString(phonebook, Date());
        response.set("Content-Type", "text/html")
        response.send(HTMLresponse).end();

    })
}
/**
 * createInfoPageString(phonebook, date) => string
 *      phonebook: [{person1}, {person2}, ...]
 *      date: Date object (current time)
 * PRE: phonebook != null
 * PRE: date != null
 */ 
function createInfoPageString(phonebook, date) {
    let HTMLresponse = ""
    if (phonebook.length == 0) {
        HTMLresponse += `<div>Phonebook has no records</div>`
    } else if (phonebook.length == 1) {
        HTMLresponse += `<div>Phonebook has info for 1 person</div>`
    } else {
        HTMLresponse += `<div>Phonebook has info for ${phonebook.length} people</div>`
    }
    HTMLresponse += `<div>${date}</div>`
    return HTMLresponse
}

/**
 * Helper functions for morgan middleware logging 
 * */ 

/**
 * PRE: req.body !== undefined // use the express-json middleware
 * POST: typeof(getRequestBody(req, res)) is javascript object
 */
function getRequestBody(req, res) {
    return req.body
}

/**
 * Produce a formatted string containing information about the request
 * PRE: tokens.body !== undefined // a new token must be defined using morgan.token()
 * PRE: tokens.body(req, res) !== undefined // use express-json middleware
 * POST: customMorganFormat(tokens, req, res) => string
 */

function customMorganFormat(tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.method(req, res) === "POST" ? 
            JSON.stringify(tokens.body(req, res)) : "",
    ].join(" ")
}