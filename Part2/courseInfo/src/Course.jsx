const Header = ({ courseName }) => (
  <div>
    <h2>{courseName}</h2>
  </div>
)

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Content = ({ parts }) => (
  <div>
    {parts.map((part) => (
      <Part key={part.id} part={part} />
    ))}
  </div>
)

const Total = ({ parts }) => {
  const sum = parts.reduce((acc, item) => acc + item.exercises, 0)
  return <p><strong>total of {sum} exercises</strong></p>
}

const Course = ({ course }) => (
  <div>
    <Header courseName={course.name} />
    <Content parts={course.parts} />
    <Total parts={course.parts} />
  </div>
)

export default Course
