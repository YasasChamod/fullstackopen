import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with: <input value={filter} onChange={handleFilterChange} />
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.addPerson}>
      <div>
        name: <input value={props.newName} onChange={props.handleNameChange} />
      </div>
      <div>
        number: <input value={props.newNumber} onChange={props.handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ personsToShow, handleDelete }) => {
  return (
    <ul>
      {personsToShow.map(person => (
        <li key={person.name}>
          {person.name} {person.number} <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
        </li>
      ))}
    </ul>
  )
}

const Notification = ({ notification }) => {
  if (!notification) return null

  const notificationStyle = {
    color: notification.type === 'success' ? 'green' : 'red',
    background: 'lightgrey',
    fontSize: 16,
    border: `2px solid ${notification.type === 'success' ? 'green' : 'red'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  }

  return (
    <div style={notificationStyle}>
      {notification.message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
      .catch(error => {
        console.error('Error fetching phonebook data:', error)
      })
  }, [])

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setFilter(event.target.value)

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (!confirmUpdate) {
        return
      }

      const updatedPerson = { ...existingPerson, number: newNumber }

      personService
        .update(existingPerson.id, updatedPerson)
        .then(response => {
          setPersons(persons.map(person =>
            person.id !== existingPerson.id ? person : response.data
          ))
          setNewName('')
          setNewNumber('')
          setNotification({
            message: `Updated ${newName}`,
            type: 'success'
          })
          setTimeout(() => setNotification(null), 5000)
        })
        .catch(error => {
          console.error(`Error updating phone number for ${newName}:`, error)
          const message = error.response?.data?.error || 'Unknown error'
          setErrorMessage(message)
          setTimeout(() => setErrorMessage(null), 5000)

          if (error.response && error.response.status === 404) {
            setPersons(persons.filter(person => person.id !== existingPerson.id))
          }
        })

      return
    }

    const personObject = { 
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(createdPerson => {
        setPersons(persons.concat(createdPerson.data))
        setNewName('')
        setNewNumber('')
        setNotification({
          message: `Added ${newName}`,
          type: 'success'
        })
        setTimeout(() => setNotification(null), 5000)
      })
      .catch(error => {
        console.error('Error adding person:', error)
        const message = error.response?.data?.error || 'Unknown error'
        setErrorMessage(message)
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          setNotification({
            message: `Deleted ${name}`,
            type: 'success'
          })
          setTimeout(() => setNotification(null), 5000)
        })
        .catch(error => {
          console.error(`Error deleting person ${name}:`, error)
          setNotification({
            message: `Information of ${name} has already been removed from server`,
            type: 'error'
          })
          setPersons(persons.filter(p => p.id !== id))
          setTimeout(() => setNotification(null), 5000)
        })
    }
  }

  const personsToShow = filter === ''
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <style>{`button:hover { background-color: lightblue; }`}</style>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      {errorMessage && <div style={{ color: 'red', marginBottom: 20 }}>{errorMessage}</div>}
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      
      <h3>Add a new</h3>
      <PersonForm 
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      
      <h3>Numbers</h3>
      <Persons personsToShow={personsToShow} handleDelete={deletePerson} />
    </div>
  )
}

export default App