import React from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

export default function TodoForm({
  onSubmit,
  description,
  setDescription,
  error,
}) {
  return (
    <form onSubmit={onSubmit}>
      <TextField
        value={description}
        onChange={e => setDescription(e.target.value)}
        label="Description"
        fullWidth
        margin="normal"
        error={Boolean(error)}
        helperText={error ? error : ''}
      />
      <Button color="primary" type="submit">
        Create
      </Button>
    </form>
  )
}
