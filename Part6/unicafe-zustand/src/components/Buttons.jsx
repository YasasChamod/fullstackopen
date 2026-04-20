import useFeedbackStore from '../store'

const Buttons = () => {
  const increaseGood = useFeedbackStore((state) => state.increaseGood)
  const increaseNeutral = useFeedbackStore((state) => state.increaseNeutral)
  const increaseBad = useFeedbackStore((state) => state.increaseBad)

  return (
    <div>
      <button onClick={increaseGood}>good</button>
      <button onClick={increaseNeutral}>neutral</button>
      <button onClick={increaseBad}>bad</button>
    </div>
  )
}

export default Buttons
