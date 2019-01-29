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
import Divider from '@material-ui/core/Divider'
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
import { useQuery, useMutation } from 'react-apollo-hooks'

import NavBar from 'client/components/NavBar'
import StarRating from 'client/components/StarRating'
import SendTextDialog from 'client/components/SendTextDialog'
import UpdateSmsTemplate from 'client/mutations/UpdateSmsTemplate.gql'
import CreateSmsTemplate from 'client/mutations/CreateSmsTemplate.gql'
import SetDefaultSmsTemplate from 'client/mutations/SetDefaultSmsTemplate.gql'
import DeleteSmsTemplate from 'client/mutations/DeleteSmsTemplate.gql'

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
      _id
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
  return baseLength + 30 + 21 // TODO: Use real lengths from schema
}

function populateTemplate(template) {
  return template
    .replace('[Customer Name]', 'John Doe')
    .replace('[Google Review Link]', 'http://bit.ly/2FK88kN')
}

function TextTemplates({ business }) {
  const [creating, setCreating] = useState(null)
  const [editing, setEditing] = useState(null)
  const [menu, setMenu] = useState(null)
  const [deleting, setDeleting] = useState({ open: false, template: {} })
  const [send, setSend] = useState({ open: false, template: {} })
  const updateSmsTemplate = useMutation(UpdateSmsTemplate)
  const createSmsTemplate = useMutation(CreateSmsTemplate)
  const setDefaultSmsTemplate = useMutation(SetDefaultSmsTemplate)
  const deleteSmsTemplate = useMutation(DeleteSmsTemplate)

  const templates = creating
    ? [creating, ...business.smsTemplates]
    : business.smsTemplates

  const handleOpenSend = template => e => {
    setSend({ open: true, template })
  }

  function handleCloseSend() {
    setSend({ ...send, open: false })
  }

  function handleCreate() {
    const defaultTemplate = {
      _id: 'creating',
      name: '',
      template: `Hi [Customer Name]! Thanks so much for choosing ${
        business.name
      }. Please tap this link to let us know how we're doing. [Google Review Link]`,
      default: false,
    }
    setCreating(defaultTemplate)
    setEditing(defaultTemplate)
  }

  function handleTemplateNameOnChange(e) {
    const value = e.target.value
    setEditing({
      ...editing,
      name: value,
      submitError: null,
    })
  }

  function handleTemplateOnChange(e) {
    const value = e.target.value
    setEditing({
      ...editing,
      template: value,
      submitError: null,
    })
  }

  const handleMenu = template => e => {
    const showDelete = !template.default && templates.length > 1
    const showDefault = !template.default

    setMenu({
      template,
      anchorEl: e.currentTarget,
      showDefault,
      showDelete,
    })
  }

  function handleEdit() {
    setEditing(menu.template)
    setMenu(null)
  }

  function handleSaveEdit() {
    setEditing({
      ...editing,
      submitting: true,
    })
    updateSmsTemplate({
      variables: {
        input: {
          _id: editing._id,
          businessId: business._id,
          name: editing.name,
          template: editing.template,
        },
      },
    }).then(
      () => {
        setEditing(null)
      },
      err => {
        setEditing({
          ...editing,
          submitting: false,
          submitError: err.message,
        })
      },
    )
  }

  function handleSaveCreate() {
    setEditing({
      ...editing,
      submitting: true,
    })
    createSmsTemplate({
      variables: {
        input: {
          businessId: business._id,
          name: editing.name,
          template: editing.template,
        },
      },
    }).then(
      () => {
        setCreating(null)
        setEditing(null)
      },
      err => {
        setEditing({
          ...editing,
          submitting: false,
          submitError: err.message,
        })
      },
    )
  }

  function handleMakeDefault() {
    const { _id } = menu.template
    setMenu(null)
    setDefaultSmsTemplate({
      variables: { input: { _id, businessId: business._id } },
    })
    // TODO: Catch error show snack
  }

  function handleSetDeleting() {
    setDeleting({ open: true, template: menu.template })
    setMenu(null)
  }

  function handleCloseDeleteDialog() {
    setDeleting({ ...deleting, open: false })
  }

  function handleDelete() {
    const { _id } = deleting.template
    handleCloseDeleteDialog()
    deleteSmsTemplate({
      variables: { input: { _id, businessId: business._id } },
    })
    // TODO: Catch error snack
  }

  return (
    <Fragment>
      <Toolbar disableGutters style={{ marginBottom: 8 }}>
        <Typography variant="h5">SMS Templates</Typography>
        <div style={{ flexGrow: 1 }} />
        <Button color="primary" variant="outlined" onClick={handleCreate}>
          <AddIcon style={{ marginRight: 8 }} />
          Create
        </Button>
      </Toolbar>
      <Paper>
        <List>
          {templates.map((template, i) => {
            const showDivider = i < templates.length - 1
            if (editing && editing._id === template._id) {
              const dirty =
                editing.template.trim() !== template.template ||
                editing.name !== template.name
              const trueLength = getTrueSmsLength(editing.template)
              const missingVariables = checkSmsVariables(editing.template)
              const error =
                trueLength > 255 ||
                Boolean(missingVariables) ||
                Boolean(editing.submitError)

              return (
                <Fragment key={template._id}>
                  <ListItem component="div">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      <TextField
                        label="Name"
                        placeholder="My Template"
                        value={editing.name}
                        onChange={handleTemplateNameOnChange}
                        margin="normal"
                        style={{ maxWidth: 200 }}
                        max="100"
                        required
                        variant="outlined"
                      />
                      <TextField
                        variant="outlined"
                        fullWidth
                        value={editing.template}
                        onChange={handleTemplateOnChange}
                        multiline
                        helperText={
                          missingVariables ||
                          editing.submitError ||
                          `${trueLength}/255`
                        }
                        FormHelperTextProps={{
                          component: function helperText(props) {
                            return (
                              <div {...props} style={{ textAlign: 'right' }} />
                            )
                          },
                        }}
                        margin="normal"
                        error={error}
                      />
                      <div
                        style={{
                          display: 'flex',
                          flex: 1,
                          justifyContent: 'space-between',
                        }}
                      >
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            if (creating) {
                              setCreating(null)
                            }
                            setEditing(null)
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          disabled={
                            editing.submitting || error || (!dirty && !creating)
                          }
                          onClick={creating ? handleSaveCreate : handleSaveEdit}
                        >
                          <CheckIcon />
                        </IconButton>
                      </div>
                    </div>
                  </ListItem>
                  {showDivider && <Divider />}
                </Fragment>
              )
            } else {
              return (
                <Fragment key={template._id}>
                  <ListItem button onClick={handleOpenSend(template)}>
                    <IconButton onClick={handleOpenSend(template)}>
                      <SmsIcon
                        color={template.default ? 'primary' : 'inherit'}
                      />
                    </IconButton>
                    <ListItemText
                      primary={
                        <Typography variant="h6">{template.name}</Typography>
                      }
                      secondary={populateTemplate(template.template)}
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
                  {showDivider && <Divider />}
                </Fragment>
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
        MenuListProps={{
          style: { minWidth: 128 },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        {menu && menu.showDefault && (
          <MenuItem onClick={handleMakeDefault}>
            <FavIcon style={{ marginRight: 8 }} /> Default
          </MenuItem>
        )}
        {menu && menu.showDelete && (
          <MenuItem onClick={handleSetDeleting}>
            <TrashIcon style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        )}
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
      <SendTextDialog {...send} onClose={handleCloseSend} business={business} />
    </Fragment>
  )
}

function ReviewDetails({ business }) {
  return (
    <Fragment>
      <Typography variant="h5">
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
