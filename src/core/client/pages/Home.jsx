import React from 'react'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import TodoFormContainer from 'todos/client/containers/TodoFormContainer'
import TodosListContainer from 'todos/client/containers/TodosListContainer'

function Home({ classes }) {
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h5">Todos</Typography>
        <TodoFormContainer />
        <TodosListContainer />
      </Paper>
    </div>
  )
}

export default withStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paper: {
    maxWidth: '600px',
    padding: theme.spacing.unit * 4,
  },
}))(Home)
