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
              variant="h3"
              gutterBottom
              style={{ textAlign: 'center' }}
            >
              Check In
            </Typography>
            <TextField
              id="name"
              name="name"
              placeholder="Name"
              autoComplete="new-password"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name && touched.name}
              helperText={
                errors.name && touched.name
                  ? errors.name
                  : values.name
                  ? 'Name'
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              autoComplete="new-password"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone && touched.phone}
              helperText={
                errors.phone && touched.phone
                  ? errors.phone
                  : values.phone
                  ? 'Phone Number'
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="email"
              name="email"
              placeholder="Email Address"
              autoComplete="new-password"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email && touched.email}
              helperText={
                errors.email && touched.email
                  ? errors.email
                  : values.email
                  ? 'Email Address'
                  : undefined
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
                style={{ minHeight: 60, marginBottom: 16 }}
              >
                Submit
              </Button>
              <Button
                color="secondary"
                onClick={handleReset}
                disabled={!dirty || isSubmitting}
                fullWidth
              >
                Reset
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
          <Typography variant="h2" style={{ marginTop: 64, marginBottom: 64 }}>
            Logo Here
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
