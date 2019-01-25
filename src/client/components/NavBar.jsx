import React, { Fragment, useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { Link } from '@reach/router'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import AccountCircle from '@material-ui/icons/AccountCircle'
import { logout } from 'meteor-apollo-accounts'
import { useApolloClient } from 'react-apollo-hooks'

import { FROM_APP_QUERY_PARAM } from 'client/constants'
import { withStyles } from '@material-ui/core/styles'
import { ListSubheader } from '@material-ui/core'

const NavLink = props => <Link style={{ textDecoration: 'none' }} {...props} />
const NavButtonLink = props => <Button component={NavLink} {...props} />

function PublicLinks() {
  return (
    <Fragment>
      <NavButtonLink to="/login">Login</NavButtonLink>
      <NavButtonLink to="/onboarding">Sign Up</NavButtonLink>
    </Fragment>
  )
}

const PrivateLinks = ({ currentUser }) => {
  return (
    <Fragment>
      <NavButtonLink to="/check-in">Check In</NavButtonLink>
      <NavButtonLink to="/dashboard">Dashboard</NavButtonLink>
      <NavButtonLink to="/onboarding">Sign Up</NavButtonLink>
      <User currentUser={currentUser} />
    </Fragment>
  )
}

function User({ currentUser }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const client = useApolloClient()

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleLogout() {
    handleClose()
    logout(client)
  }

  return (
    <Fragment>
      <IconButton
        aria-owns={anchorEl ? 'user-menu' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          subheader: (
            <ListSubheader component="div">
              {currentUser.profile.name}
            </ListSubheader>
          ),
        }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Fragment>
  )
}

function Brand({ currentUser, className }) {
  return (
    <div className={className}>
      <NavLink to={currentUser ? `/?${FROM_APP_QUERY_PARAM}=1` : '/'}>
        <Typography
          variant="button"
          style={{ display: 'inline-block', padding: '4px 8px' }}
        >
          Erby.io
        </Typography>
      </NavLink>
    </div>
  )
}

function NavBar({ currentUser, title, classes }) {
  return (
    <Fragment>
      <AppBar color="inherit">
        <Toolbar>
          <Brand currentUser={currentUser} className={classes.brand} />
          {title && (
            <Typography className={classes.title} variant="h6" noWrap>
              {title}
            </Typography>
          )}
          <div className={classes.grow} />
          {currentUser ? (
            <PrivateLinks currentUser={currentUser} />
          ) : (
            <PublicLinks />
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Fragment>
  )
}

const styles = theme => ({
  brand: {
    marginLeft: -12,
    marginRight: 20,
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
  title: {
    display: 'none',
    borderLeft: `1px solid ${theme.palette.primary.main}`,
    paddingLeft: 24,
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  grow: {
    flexGrow: 1,
  },
})

export default withStyles(styles)(NavBar)
