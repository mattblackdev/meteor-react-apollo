import React from 'react'

import useDeleteTodo from 'todos/client/hooks/useDeleteTodo'
import TodoListItem from 'todos/client/components/TodoListItem'

export default function TodoListItemContainer({ todo }) {
  const deleteTodo = useDeleteTodo()
  return <TodoListItem todo={todo} deleteTodo={deleteTodo} />
}
