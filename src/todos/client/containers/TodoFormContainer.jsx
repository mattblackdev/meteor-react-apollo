import React, { useState } from 'react'

import useCreateTodo from 'todos/client/hooks/useCreateTodo'
import TodoForm from 'todos/client/components/TodoForm'

export default function TodoFormContainer() {
  const createTodo = useCreateTodo()
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    createTodo({ description }).then(
      () => {
        setError(null)
        setDescription('')
      },
      e => setError(e.message),
    )
  }

  return (
    <TodoForm
      onSubmit={handleSubmit}
      description={description}
      setDescription={setDescription}
      error={error}
    />
  )
}
