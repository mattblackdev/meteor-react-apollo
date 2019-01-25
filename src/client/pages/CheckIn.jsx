import React from 'react'
import { useMutation } from 'react-apollo-hooks'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import SEND_GOOGLE_REVIEW_SMS from '../mutations/SEND_GOOGLE_REVIEW_SMS'
import { VALID_PHONE_REGEX } from 'client/constants'
import { Redirect } from '@reach/router'

function CheckInForm() {
  const sendGoogleReviewSms = useMutation(SEND_GOOGLE_REVIEW_SMS)
  return (
    <Formik
      initialValues={{ name: '', phone: '', email: '' }}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        const result = await sendGoogleReviewSms({
          variables: { input: values },
        })
        resetForm()
        setSubmitting(false)
        console.log('result', result)
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .min(2, 'Must be at least 2 characters')
          .max(30, 'Please use less than 31 characters')
          .required('Name is required'),
        phone: Yup.string()
          .matches(VALID_PHONE_REGEX, 'Phone number is not valid')
          .required('Phone number is required'),
        email: Yup.string()
          .email()
          .required('Email is required'),
      })}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props
        return (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Typography
              variant="h2"
              gutterBottom
              style={{ textAlign: 'center' }}
            >
              Check in
            </Typography>
            <TextField
              id="name"
              name="name"
              label="Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name && touched.name}
              helperText={errors.name && touched.name ? errors.name : undefined}
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="new-name"
            />
            <TextField
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone && touched.phone}
              helperText={
                errors.phone && touched.phone ? errors.phone : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="new-phone"
            />
            <TextField
              id="email"
              name="email"
              label="Email Address"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email && touched.email}
              helperText={
                errors.email && touched.email ? errors.email : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="new-email"
            />

            <div style={{ marginTop: 32 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!dirty || isSubmitting}
                fullWidth
                style={{ minHeight: 60 }}
              >
                Request Google Review
              </Button>
            </div>
          </form>
        )
      }}
    </Formik>
  )
}

export default function CheckIn({ currentUser, path }) {
  if (!currentUser) return <Redirect from={path} to="/" noThrow />
  return (
    <div>
      <Grid container justify="center">
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Typography variant="h4" style={{ marginTop: 64, marginBottom: 64 }}>
            Company X logo here
          </Typography>
        </Grid>
        <Grid item style={{ maxWidth: 500 }}>
          <Paper style={{ padding: 32 }}>
            <CheckInForm />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
