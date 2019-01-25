import React from 'react'
import { Redirect } from '@reach/router'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

import { FROM_APP_QUERY_PARAM } from '../constants'
import NavBar from '../components/NavBar'

function Home({ path, currentUser, location, classes }) {
  if (!location.search.includes(FROM_APP_QUERY_PARAM) && currentUser) {
    return <Redirect from={path} to="dashboard" noThrow />
  }

  return (
    <div>
      <NavBar currentUser={currentUser} />
      <div className={classes.jumbotron}>
        <Typography variant="h2" className={classes.jumbotronText}>
          Need more reviews?
        </Typography>
        <Button
          id="cta-button"
          color="secondary"
          variant="contained"
          className={classes.ctaButton}
        >
          <span role="img" aria-labelledby="cta-button" className={classes}>
            ⭐️
          </span>
          Get more reviews
          <span role="img" aria-labelledby="cta-button">
            ⭐️
          </span>
        </Button>
      </div>
    </div>
  )
}

const styles = theme => ({
  jumbotron: {
    backgroundColor: theme.palette.primary['A200'],
    marginTop: theme.spacing.unit * 16,
    padding: theme.spacing.unit * 4,
    textAlign: 'center',
  },
  jumbotronText: {
    textAlign: 'center',
    lineHeight: 1.3,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  ctaButton: {
    backgroundColor: theme.palette.secondary['A100'],
    padding: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 3,
  },
})

export default withStyles(styles)(Home)
