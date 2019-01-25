import React, { Fragment, useState } from 'react'
import { Redirect, Router } from '@reach/router'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import TextField from '@material-ui/core/TextField'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import SmsIcon from '@material-ui/icons/Sms'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import MoreIcon from '@material-ui/icons/MoreVert'
import TrashIcon from '@material-ui/icons/Delete'
import FavIcon from '@material-ui/icons/Favorite'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo-hooks'

import NavBar from 'client/components/NavBar'
import StarRating from 'client/components/StarRating'
import useList from 'client/hooks/useList'

const DashboardQuery = gql`
  query {
    businesses {
      _id
      name
      slug
      currentUserRole
    }
  }
`

function BusinessesList({ navigate, currentUser, path }) {
  console.log('business list')
  const {
    data: { businesses },
    loading,
    error,
  } = useQuery(DashboardQuery, { suspend: false })
  if (loading) return null
  if (error) return `Error: ${error.message}`
  if (businesses.length === 1)
    return (
      <Redirect from={path} to={`/dashboard/${businesses[0].slug}`} noThrow />
    )

  const handleClick = slug => () => navigate(slug)

  return (
    <Fragment>
      <NavBar currentUser={currentUser} title="Businesses" />
      <List>
        {businesses.map(business => (
          <BusinessListItem
            business={business}
            key={business._id}
            onClick={handleClick(business.slug)}
          />
        ))}
      </List>
    </Fragment>
  )
}

function BusinessListItem({ business, onClick }) {
  return (
    <ListItem button onClick={onClick}>
      <ListItemText>{business.name}</ListItemText>
      <Chip variant="outlined" label={business.currentUserRole} />
    </ListItem>
  )
}

const BusinessBySlug = gql`
  query BusinessBySlug($slug: String!) {
    businessBySlug(slug: $slug) {
      name
      currentUserRole
      reviewDetails {
        googleRating
        googleReviews {
          rating
          author_name
          text
          relative_time_description
          time
        }
      }
      smsTemplates {
        _id
        name
        template
        default
      }
    }
  }
`

function BusinessDashboard({ slug, currentUser, path }) {
  console.log('business dashboard')
  const {
    data: { businessBySlug: business },
    loading,
    error,
  } = useQuery(BusinessBySlug, { suspend: false, variables: { slug } })
  if (loading) return <Typography>Loading</Typography>
  if (error) return `Error: ${error.message}`
  if (!business) return <Redirect from={path} to="/" noThrow />

  return (
    <Fragment>
      <NavBar currentUser={currentUser} title={business.name} />
      <div style={{ padding: '64px 16px 32px 16px' }}>
        <Grid container justify="center">
          <Grid item>
            <Grid container justify="center" style={{ maxWidth: 800 }}>
              <Grid item xs={12}>
                <TextTemplates business={business} />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 64 }}>
                <ReviewDetails business={business} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  )
}

function checkSmsVariables(template) {
  const customerNameMatches = template.match(/\[Customer Name\]/g)
  if (!customerNameMatches) return 'Please include "[Customer Name]"'
  if (customerNameMatches.length > 1)
    return 'Please only use "[Customer Name]" once'
  const reviewLinkMatches = template.match(/\[Google Review Link\]/g)
  if (!reviewLinkMatches) return 'Please include "[Google Review Link]"'
  if (reviewLinkMatches.length > 1)
    return 'Please only use "[Google Review Link]" once'
  return ''
}

function getTrueSmsLength(template) {
  const baseLength = template
    .trim()
    .replace('[Customer Name]', '')
    .replace('[Google Review Link]', '').length
  return baseLength + 30 + 21
}

function TextTemplates({ business }) {
  const [editing, setEditing] = useState(null)
  const [menu, setMenu] = useState(null)
  const [deleting, setDeleting] = useState({ open: false, template: {} })

  function handleOnChange(e) {
    const value = e.target.value
    setEditing({
      ...editing,
      template: value,
    })
  }

  const handleMenu = template => e => {
    setMenu({
      template,
      anchorEl: e.currentTarget,
    })
  }

  function handleEdit() {
    setEditing(menu.template)
    setMenu(null)
  }

  function handleMakeDefault() {
    setMenu(null)
  }

  function handleSetDeleting() {
    setDeleting({ open: true, template: menu.template })
    setMenu(null)
  }

  function handleCloseDeleteDialog() {
    setDeleting({ ...deleting, open: false })
  }

  function handleDelete() {
    handleCloseDeleteDialog()
  }

  return (
    <Fragment>
      <Toolbar disableGutters style={{ marginBottom: 8 }}>
        <Typography variant="h4">Sms Templates</Typography>
        <div style={{ flexGrow: 1 }} />
        <Button color="primary" variant="outlined">
          <AddIcon style={{ marginRight: 8 }} />
          Create
        </Button>
      </Toolbar>
      <Paper>
        <List>
          {business.smsTemplates.map(template => {
            if (editing && editing._id === template._id) {
              const dirty = editing.template.trim() !== template.template
              const trueLength = getTrueSmsLength(editing.template)
              const missingVariables = checkSmsVariables(editing.template)
              const error = trueLength > 255 || Boolean(missingVariables)

              return (
                <ListItem key={template._id} component="div">
                  <IconButton
                    color="secondary"
                    onClick={() => setEditing(null)}
                  >
                    <CloseIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    value={editing.template}
                    onChange={handleOnChange}
                    multiline
                    style={{ marginRight: 28 }}
                    helperText={missingVariables || `${trueLength}/255`}
                    FormHelperTextProps={{
                      component: function helperText(props) {
                        return <div {...props} style={{ textAlign: 'right' }} />
                      },
                    }}
                    error={error}
                  />
                  <ListItemSecondaryAction>
                    <IconButton color="primary" disabled={error || !dirty}>
                      <CheckIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            } else {
              return (
                <ListItem key={template._id} button>
                  <IconButton>
                    <SmsIcon color={template.default ? 'primary' : 'inherit'} />
                  </IconButton>
                  <ListItemText
                    primary={
                      <Typography variant="h6">{template.name}</Typography>
                    }
                    secondary={template.template}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      aria-label="More Options"
                      aria-owns={
                        menu && menu.anchorEl
                          ? 'sms-template-options-menu'
                          : undefined
                      }
                      aria-haspopup="true"
                      onClick={handleMenu(template)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            }
          })}
        </List>
      </Paper>
      <Menu
        id="sms-template-options-menu"
        anchorEl={menu && menu.anchorEl}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleMakeDefault}>
          <FavIcon style={{ marginRight: 8 }} /> Default
        </MenuItem>
        <MenuItem onClick={handleSetDeleting}>
          <TrashIcon style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
      <Dialog
        open={deleting.open}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-sms-template-dialog-title"
        aria-describedby="delete-sms-template-dialog-description"
      >
        <DialogTitle id="delete-sms-template-dialog-title">
          Delete {deleting.template.name}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-sms-template--dialog-description">
            &quot;{deleting.template.template}&quot;
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

function ReviewDetails({ business }) {
  return (
    <Fragment>
      <Typography variant="h4">
        Google Rating: {business.reviewDetails.googleRating} / 5
      </Typography>
      <List>
        {business.reviewDetails.googleReviews.map((review, key) => (
          <ListItem component="div" key={key} disableGutters>
            <Paper style={{ padding: 16, width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 8,
                }}
              >
                <Typography variant="h6">{review.author_name}</Typography>
                <div>
                  <StarRating rating={review.rating} />
                </div>
              </div>
              <Typography variant="body2">{review.text}</Typography>
            </Paper>
          </ListItem>
        ))}
      </List>
    </Fragment>
  )
}

export default function Dashboard({ currentUser, path }) {
  console.log('dashboard')
  if (!currentUser) return <Redirect from={path} to="/login" noThrow />
  return (
    <Router>
      <BusinessesList path="/" currentUser={currentUser} />
      <BusinessDashboard path="/:slug" currentUser={currentUser} />
    </Router>
  )
}
