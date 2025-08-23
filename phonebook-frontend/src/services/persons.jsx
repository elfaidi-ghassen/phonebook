import axios from 'axios'
const baseURL = "http://localhost:3001/persons"

/// getAll() => Promise
function getAll() {
    // fetch all entries from the server
    return axios
        .get(baseURL)
        .then(response => response.data)
}

/// person: {name: string, ...} // The id field NOT included
/// add(person) => Promise
function add(person) {
    // the server will generate an id for the new person entry
    return axios
        .post(baseURL, person)
        .then(response => response.data)
}

/// deleteById(id: number) => Promise
function deleteById(id) {
    return axios.delete(`${baseURL}/${id}`)
}

/// update(id: number , updatedPerson: {name: ...}) => Promise
function update(id, updatedPerson) {
    return axios
        .put(`${baseURL}/${id}`, updatedPerson)
        .then(response => response.data)
}

export default { getAll, add, deleteById, update }