import { useState, useEffect } from 'react'
import personService from './services/persons'

const EMPTY = ""

/// message is {type: string, content: string} | null
/// type is one of: "info" | "error" (lowercase)
const Notification = ({message}) => {
  if (message === null) {
    return null;
  }
  return (
    <div className={message.type}>
      {message.content}
    </div>
  )
}

const Filter = ({searchString, onChange}) => {
  return (
    <div>
          filter shown with
          <input 
            value={searchString}
            onChange={onChange}
          />
    </div>)
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
      <div>
        name: 
        <input 
          type="text"
          value={props.newName}
          onChange={props.onNameChange}
        />
      </div>
      <div>
        number: 
        <input 
          type="text"
          value={props.newPhoneNumber}
          onChange={props.onPhoneChange}
        />
      </div>
      <div>
        <button 
          type="submit">
          {props.submitBtnText}
        </button>
      </div>
    </form>
  )
}

const Persons = ({persons, personToHTML}) => {
  return (
    <div>
      {persons.map(personToHTML)}
    </div>
  )
}

const Button = ({text, onClick}) => {
  return <button onClick={onClick}>{text}</button>
}

const App = () => {
  ///> State: Persons
  // Represent a list of people: [{name: ...}, ...]
  // [{ name: a string representing the name of the person }]
  const [persons, setPersons] = useState([])

  ///> State: newName
  // used to create a "controlled component"  
  // for the name <input> field
  const [newName, setNewName] = useState("")

  ///> State: newPhoneNumber
  // used to create a "controlled component"  
  // for the phone number <input> field
  // the phone number is represented as a string
  const [newPhoneNumber, setNewPhoneNumber] = useState("")

  ///> State: searchString
  // used to create a "controlled component"  
  // for the search by name <input> field
  const [searchString, setSearchString] = useState("")

  ///> State: message
  // represent the error/info message displayed to the user
  // {type: string, content: string}
  const [message, setMessage] = useState(null)
  const messageDisplayDuration = 4000
  
  useEffect(resetNotificationMessage, [message])
  useEffect(loadPeopleRecords, [])

  
  
  const shownPersons = persons.filter(filterByName(searchString))



  return (
    <div>
      <Notification message={message} type="info"/>
      <h2>Phonebook</h2>
      <Filter 
        searchString={searchString} 
        onChange={handleSearchChange}/>
      <h2>Add a new</h2>
      <PersonForm 
        onSubmit={handleAddEntry}
        newName={newName}
        newPhoneNumber={newPhoneNumber}
        onNameChange={handleNameChange}
        onPhoneChange={handlePhoneChange}
        submitBtnText="add"
        />
      <h2>Numbers</h2>
      <Persons
        persons={shownPersons}
        personToHTML={personToHTML}
      />
    </div>
  )
  
  /// ****************************************
  /// Helper Functions


  // TODO
  function loadPeopleRecords() {
    personService
          .getAll()
          .then(persons =>
              setPersons(persons))
  }

  // TODO
  function resetNotificationMessage() {
    if (message === null) return;
      setTimeout(
        () => setMessage(null),
     messageDisplayDuration)
  }



  // personToHTML(person: {name: ...}) => HTML
  // produce JSX for a person entry
  function personToHTML(person) {
    return (
      <p key={person.id}>
        {person.name} {person.number}
        <Button 
          onClick={() => handleDeleteOf(person.id)}
          text="delete"/>
      </p>)
  }

  // callback for the delete entry event on the button element 
  function handleDeleteOf(id) {
    let confirmed = confirm(`Delete ${getPerson(id).name}`)
    if (!confirmed) { return }
    
    personService
      .deleteById(id)
      .then(() => {
        setPersons(persons.filter(person => person.id != id))
      })
      .catch((error) => {
        let messageContent = 
        `Information about ${getPerson(id).name} has already been deleted from server`;
        setMessage({type: "error", content: messageContent})
        setPersons(persons.filter(person => person.id != id))
      })
  } 

  // getPerson(id) => {name: ...}
  // return a person object from the state (NOT from the server)
  function getPerson(id) {
    return persons.find(person =>
             person.id == id)
  }

  // personByName(name) => {name: ...}
  // return a person object from the state (NOT from the server)
  // invariant: a name can only appear once in the phonebook
  function personByName(name) {
    return persons.find(person =>
             person.name == name)
  }

  // filterByName(string) => <function object>
  // return a predicate function to test of the name contains a search string
  // if searchString is empty, then the returned predicate always produce true
  function filterByName(searchString) {
    searchString = searchString.trim().toLowerCase()
    if (searchString === "") {
      return _ => true
    } else {
      return person => person.name
                      .toLowerCase()
                      .includes(searchString)
    }
  }



  // used as a callback for the onChange event
  // in the search by name <input> field
  function handleSearchChange(event) {
    let newSearchString = event.target.value;
    setSearchString(newSearchString)
  }

  // used as a callback for the onChange event
  // in the phone number <input> field
  function handlePhoneChange(event) {
    let newPhoneNumber = event.target.value;
    setNewPhoneNumber(newPhoneNumber)
  }

  // used as a callback for the form submission event 
  function handleAddEntry(event) {
    event.preventDefault();
    let newPerson = {
        name: newName,
        number: newPhoneNumber
        // ~~id: ...~~ -- WILL GENERATED BY SERVER
    }
    if (nameAlreadyExist(newPerson)) {
      let confirmed = confirm(`${newPerson.name} is already in the phonebook, replace the old number with the new one?`)
      if (!confirmed) { return }
      let id = personByName(newPerson.name).id
      personService
        .update(id, {id, ...newPerson})
        .then((updatedPerson) => {
          setPersons(persons.map(person =>
            person.id == id ? updatedPerson: person))
          let messageContent = `phone number of ${updatedPerson.name} was updated`
          setMessage({type: "error", content: messageContent})

        })
        .catch((error) => {
          let messageContent = "already deleted from server"
          setMessage({type: "error", content: messageContent})
          setPersons(persons.filter(person => person.id != id))
        })
    } else {
      addNewPerson(newPerson);
    }
  }
  
  // personAlreadyExist({name: ..., ...}) => true | false
  // evaluate to true if the person NAME already exists
  // in the list of people's names in the phonebook
  function nameAlreadyExist(newPerson) {
    return persons.map(person => person.name)
                  .includes(newPerson.name)
  }

  // adds a new person to the Persons state
  // leading to re-rendering the component 
  function addNewPerson(newPerson) {
    personService
      .add(newPerson)
      .then(addedPerson => {
        const newPersonsList = persons.concat(addedPerson)
        setPersons(newPersonsList)
        setNewName(EMPTY)
        setNewPhoneNumber(EMPTY)
        setMessage({
          type: "info",
          content: `Added ${addedPerson.name}`
        })
      })

  }

  // used as a callback for the onChange event
  // in the name <input> field
  function handleNameChange(event) {
    setNewName(event.target.value)
  }
}
export default App