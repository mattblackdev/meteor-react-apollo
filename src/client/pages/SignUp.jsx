import React, { Fragment, useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem'
import { Redirect } from '@reach/router'

import SIGN_UP_BUSINESS from 'client/mutations/SIGN_UP_BUSINESS'
import { VALID_PHONE_REGEX } from 'client/constants'
import NavBar from '../components/NavBar'

const nameSchema = Yup.string()
  .max(100, 'Please use less than 100 characters')
  .required('Name is required')
const addressSchema = Yup.object().shape({
  address1: Yup.string()
    .min(1)
    .max(300)
    .required('Address is required'),
  address2: Yup.string().max(300),
  city: Yup.string()
    .min(2)
    .max(100)
    .required('City is required'),
  zip: Yup.string()
    .min(5)
    .max(5)
    .required('Zip Code is required'),
  state: Yup.string()
    .min(2)
    .max(2)
    .required('State is required'),
})
const ownerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2)
    .max(100)
    .required('Business owner name is required'),
  phone: Yup.string()
    .matches(VALID_PHONE_REGEX, 'Phone number is not valid')
    .required('Business owner phone number is required'),
  email: Yup.string()
    .email('Business owner email must be valid')
    .required('Business owner email is required'),
  password: Yup.string()
    .min(4, 'Must be at least 4 characters')
    .max(76, 'Must be less than 77 characters'),
})

const schemaWithOwner = Yup.object().shape({
  name: nameSchema,
  address: addressSchema,
  owner: ownerSchema,
})

const schemaWithoutOwner = Yup.object().shape({
  name: nameSchema,
  address: addressSchema,
})

const initialNameValue = ''
const initialAddressValues = {
  address1: '',
  address2: '',
  city: '',
  zip: '',
  state: '',
}
const initialOwnerValues = {
  name: '',
  phone: '',
  email: '',
  password: '',
}

const initialValuesWithOwner = {
  name: initialNameValue,
  address: initialAddressValues,
  owner: initialOwnerValues,
}

const initialValuesWithoutOwner = {
  name: initialNameValue,
  address: initialAddressValues,
}

function SignUpForm({ currentUser, path }) {
  const signUpBusiness = useMutation(SIGN_UP_BUSINESS)
  const [isOwner, setIsOwner] = useState(currentUser ? 'No' : 'Yes')
  const [submitError, setSubmitError] = useState(null)
  const [signedUpSlug, setSignedUpSlug] = useState(null)
  const includeOwnerFields = isOwner === 'No' || !currentUser

  if (signedUpSlug)
    return <Redirect from={path} to={`/dashboard/${signedUpSlug}`} noThrow />
  return (
    <Formik
      initialValues={
        includeOwnerFields ? initialValuesWithOwner : initialValuesWithoutOwner
      }
      onSubmit={async (values, { setSubmitting }) => {
        let input = { ...values }
        if (!includeOwnerFields) {
          input.owner = undefined
        }
        let result
        try {
          console.log('submitting', input)
          result = await signUpBusiness({
            variables: { input },
          })
          setSignedUpSlug(result.data.signUpBusiness.slug)
        } catch (e) {
          console.error(e)
          setSubmitError(e.message)
        }
        setSubmitting(false)
        console.log('sign up result', result)
      }}
      validationSchema={
        includeOwnerFields ? schemaWithOwner : schemaWithoutOwner
      }
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
          setErrors,
          setTouched,
          setValues,
        } = props

        function handleIsOwnerChange(e) {
          const newIsOwner = e.target.value
          setIsOwner(newIsOwner)
          if (newIsOwner === 'No') {
            setErrors({
              ...errors,
              owner: {},
            })
            setTouched({
              ...touched,
              owner: {},
            })
          } else if (!values.owner) {
            setValues({
              ...values,
              owner: initialOwnerValues,
            })
          }
        }

        return (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Typography
              variant="h2"
              gutterBottom
              style={{ textAlign: 'center' }}
            >
              Sign Up
            </Typography>
            <TextField
              id="name"
              name="name"
              label="Business Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name && touched.name}
              helperText={
                errors.name && touched.name
                  ? errors.name
                  : 'As listed on google maps'
              }
              fullWidth
              margin="normal"
              variant="outlined"
              required
              autoComplete="new-password"
            />
            <TextField
              id="address.address1"
              name="address.address1"
              label="Street Address 1"
              value={values.address.address1}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.address &&
                touched.address &&
                errors.address.address1 &&
                touched.address.address1
              }
              helperText={
                errors.address &&
                touched.address &&
                errors.address.address1 &&
                touched.address.address1
                  ? errors.address.address1
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              id="address.address2"
              name="address.address2"
              label="Street Address 2"
              value={values.address.address2}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.address &&
                touched.address &&
                errors.address.address2 &&
                touched.address.address2
              }
              helperText={
                errors.address &&
                touched.address &&
                errors.address.address2 &&
                touched.address.address2
                  ? errors.address.address2
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="address.city"
              name="address.city"
              label="City"
              value={values.address.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.address &&
                touched.address &&
                errors.address.city &&
                touched.address.city
              }
              helperText={
                errors.address &&
                touched.address &&
                errors.address.city &&
                touched.address.city
                  ? errors.address.city
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              id="address.state"
              name="address.state"
              label="State"
              value={values.address.state}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.address &&
                touched.address &&
                errors.address.state &&
                touched.address.state
              }
              helperText={
                errors.address &&
                touched.address &&
                errors.address.state &&
                touched.address.state
                  ? errors.address.state
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              id="address.zip"
              name="address.zip"
              label="Zip Code"
              value={values.address.zip}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                errors.address &&
                touched.address &&
                errors.address.zip &&
                touched.address.zip
              }
              helperText={
                errors.address &&
                touched.address &&
                errors.address.zip &&
                touched.address.zip
                  ? errors.address.zip
                  : undefined
              }
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            {currentUser && (
              <TextField
                id="is-owner-select"
                name="is-owner-select"
                select
                label="Are you the business owner?"
                value={isOwner}
                onChange={handleIsOwnerChange}
                fullWidth
                margin="normal"
                variant="outlined"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            )}
            {includeOwnerFields && (
              <Fragment>
                <TextField
                  id="owner.name"
                  name="owner.name"
                  label="Owner Name"
                  value={values.owner.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.name &&
                    touched.owner.name
                  }
                  helperText={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.name &&
                    touched.owner.name
                      ? errors.owner.name
                      : undefined
                  }
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                />
                <TextField
                  id="owner.phone"
                  name="owner.phone"
                  type="tel"
                  label="Owner Phone"
                  value={values.owner.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.phone &&
                    touched.owner.phone
                  }
                  helperText={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.phone &&
                    touched.owner.phone
                      ? errors.owner.phone
                      : undefined
                  }
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                />
                <TextField
                  id="owner.email"
                  name="owner.email"
                  label="Owner Email"
                  type="email"
                  value={values.owner.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.email &&
                    touched.owner.email
                  }
                  helperText={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.email &&
                    touched.owner.email
                      ? errors.owner.email
                      : undefined
                  }
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                />
                <TextField
                  id="owner.password"
                  name="owner.password"
                  label="Temporary Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.owner.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.password &&
                    touched.owner.password
                  }
                  helperText={
                    errors.owner &&
                    touched.owner &&
                    errors.owner.password &&
                    touched.owner.password
                      ? errors.owner.password
                      : 'Optional'
                  }
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Fragment>
            )}

            <div style={{ marginTop: 32 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!dirty || isSubmitting}
                fullWidth
                style={{ minHeight: 60 }}
              >
                Create Account
              </Button>
              {submitError && (
                <Typography color="error" style={{ marginTop: 16 }}>
                  {submitError}
                </Typography>
              )}
              <Button
                onClick={handleReset}
                color="secondary"
                disabled={!dirty || isSubmitting}
                fullWidth
                style={{ minHeight: 60 }}
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

export default function SignUp({ currentUser, path }) {
  return (
    <Fragment>
      <NavBar currentUser={currentUser} />
      <Grid container justify="center" style={{ margin: '32px 0px' }}>
        <Grid item sm={12} md={8} xl={6}>
          <SignUpForm currentUser={currentUser} path={path} />
        </Grid>
      </Grid>
    </Fragment>
  )
}
