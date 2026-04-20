import { useAnecdoteActions, useFilter } from '../store'

const Filter = () => {
  const filter = useFilter()
  const { setFilter } = useAnecdoteActions()

  const handleChange = (event) => {
    setFilter(event.target.value)
  }

  const style = {
    marginBottom: 10,
  }

  return (
    <div style={style}>
      filter <input value={filter} onChange={handleChange} />
    </div>
  )
}

export default Filter
