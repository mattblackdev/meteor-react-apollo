import React from 'react'

import useTodos from 'todos/client/hooks/useTodos'
import TodosList from 'todos/client/components/TodosList'

export default function TodosListContainer() {
  const { todos, error, loading } = useTodos()
  return <TodosList todos={todos} error={error} loading={loading} />
}
