import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import TrashIcon from '@material-ui/icons/Delete'

export default function TodoListItem({ todo, deleteTodo }) {
  return (
    <ListItem key={todo._id}>
      <ListItemText>{todo.description}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton
          data-test-id="delete-todo"
          onClick={() => {
            deleteTodo(todo._id)
          }}
        >
          <TrashIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}
