import React, { Fragment } from 'react'
import { Redirect } from '@reach/router'
import { useApolloClient } from 'react-apollo-hooks'
import { loginWithPassword } from 'meteor-apollo-accounts'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import NavBar from 'client/components/NavBar'

function LoginForm() {
  const apollo = useApolloClient()
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        const { email, password } = values
        try {
          const result = await loginWithPassword({ email, password }, apollo)
          console.log('result', result)
        } catch (e) {
          console.log('error', e)
          const { message } = e
          if (message && message.includes(':') && message.includes('[')) {
            const error = message
              .substring(message.indexOf(':') + 1, message.indexOf('['))
              .trim()
            if (error.includes('User')) {
              setFieldError('email', error)
            } else if (error.includes('password')) {
              setFieldError('password', error)
            }
          }
        }
        setSubmitting(false)
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email()
          .required('Email is required'),
        password: Yup.string()
          .min(4)
          .max(30)
          .required('Password is required'),
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
        } = props
        return (
          <form onSubmit={handleSubmit}>
            <Typography
              variant="h2"
              gutterBottom
              style={{ textAlign: 'center' }}
            >
              Login
            </Typography>
            <TextField
              id="email"
              name="email"
              label="Email Address"
              type="email"
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
              autoComplete="email"
              required
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password && touched.password}
              helperText={
                errors.password && touched.password
                  ? errors.password
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              required
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
                Login
              </Button>
            </div>
          </form>
        )
      }}
    </Formik>
  )
}

export default function Login({ currentUser, path }) {
  if (currentUser) {
    return <Redirect from={path} to="/dashboard" noThrow />
  }
  return (
    <Fragment>
      <NavBar />
      <Grid container justify="center" spacing={32}>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Typography variant="h4" style={{ marginTop: 32 }}>
            erby.io logo here
          </Typography>
        </Grid>
        <Grid item style={{ maxWidth: 500 }}>
          <Paper style={{ padding: 32 }}>
            <LoginForm />
          </Paper>
        </Grid>
      </Grid>
    </Fragment>
  )
}
