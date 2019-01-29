import React, { Fragment, useReducer, useEffect } from 'react'
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
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { withFormik } from 'formik'
import * as Yup from 'yup'

import { VALID_PHONE_REGEX } from 'client/constants'
import SendText from 'client/mutations/SendText'

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, 'Please use less than 100 characters')
    .required('Name is required'),
  phone: Yup.string()
    .matches(VALID_PHONE_REGEX, 'Phone number is not valid')
    .required('Business owner phone number is required'),
  email: Yup.string().email('Customer email must be valid'),
  message: Yup.string()
    .min(1, 'Message is required')
    .max(255, 'Message must be less than 255 characters')
    .required('Message is required'),
  when: Yup.string(),
})

const initialValues = {
  name: '',
  phone: '',
  email: '',
  message: '',
  when: 'NOW',
}

function SendTextDialog(props) {
  const {
    open,
    template,
    fullScreen,
    onClose,
    business,
    values,
    touched,
    errors,
    dirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    setValues,
    isValid,
  } = props
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'ChangeTemplate': {
          const { selectedTemplate } = action.payload

          return {
            ...prevState,
            selectedTemplate,
          }
        }
        default: {
          return {
            ...prevState,
          }
        }
      }
    },
    {
      selectedTemplate: template,
    },
  )
  console.log('SendTextDialog', {
    props,
    state,
  })

  function changeTemplate(templateId) {
    let selectedTemplate
    if (templateId) {
      selectedTemplate = business.smsTemplates.find(
        ({ _id }) => templateId === _id,
      )
    } else {
      selectedTemplate = business.smsTemplates.find(
        template => template.default,
      )
    }
    dispatch({ type: 'ChangeTemplate', payload: { selectedTemplate } })
    setValues({ ...values, message: selectedTemplate.template })
  }

  useEffect(
    () => {
      if (open) {
        changeTemplate(template._id)
      } else {
        changeTemplate()
      }
    },
    [open],
  )

  function handleClose() {
    handleReset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="send-text-dialog-title"
      fullScreen={fullScreen}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle id="send-text-dialog-title">Send Text</DialogTitle>
      <DialogContent>
        <TextField
          id="name"
          name="name"
          label="Name"
          required
          fullWidth
          margin="normal"
          variant="outlined"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name && touched.name}
          helperText={touched.name && errors.name}
        />
        <TextField
          id="phone"
          name="phone"
          label="Phone"
          required
          fullWidth
          margin="normal"
          variant="outlined"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.phone && touched.phone}
          helperText={touched.phone && errors.phone}
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          fullWidth
          margin="normal"
          variant="outlined"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email && touched.email}
          helperText={touched.email && errors.email}
        />
        <TextField
          id="template-select"
          name="template-select"
          label="Choose Template"
          select
          fullWidth
          margin="dense"
          variant="outlined"
          value={state.selectedTemplate._id}
          onChange={e => changeTemplate(e.target.value)}
        >
          {business.smsTemplates.map(({ _id, name }) => (
            <MenuItem key={_id} value={_id}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="message"
          name="message"
          label="Personalize"
          multiline
          fullWidth
          margin="normal"
          variant="outlined"
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.message && touched.message}
          helperText={touched.message && errors.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <div style={{ flexGrow: 1 }} />
        <TextField
          id="when"
          name="when"
          label="When"
          select
          style={{ minWidth: 120 }}
          variant="outlined"
          margin="dense"
          value={values.when}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <MenuItem value="NOW">Now</MenuItem>
          <MenuItem value="ONE_HOUR">In one hour</MenuItem>
          <MenuItem value="TWO_HOURS">In two hours</MenuItem>
          <MenuItem value="TONIGHT">Tonight</MenuItem>
          <MenuItem value="TOMORROW">Tomorrow</MenuItem>
        </TextField>
        <Button
          type="submit"
          color="primary"
          disabled={!dirty || !isValid || isSubmitting}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  )
}


const SendTextDialogContainer = withMobileDialog()(
  withFormik({
    mapPropsToValues: () => initialValues,
    handleSubmit: (values, { props: { sendText, business, templateId?? }, setSubmitting }) => {
      let input = { ...values }
      setSubmitting(false)
    },
    validationSchema,
  })(SendTextDialog),
)

export default function SendTextDialog(props) {
  const sendText = useMutation(SendText)
  return <SendTextDialogContainer {...props} sendText={sendText} />
}
