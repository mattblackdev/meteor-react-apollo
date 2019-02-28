import React from 'react'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'

import TodoListItemContainer from 'todos/client/containers/TodoListItemContainer'

export default function TodosList({ todos, error, loading }) {
  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color="error">{error.message}</Typography>
  return (
    <List id="todoList">
      {todos.map(todo => (
        <TodoListItemContainer key={todo._id} todo={todo} />
      ))}
    </List>
  )
}
