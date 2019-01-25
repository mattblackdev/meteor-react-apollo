import gql from 'graphql-tag'

export default gql`
  mutation SendGoogleReviewSMS($input: CustomerCheckInInput!) {
    sendGoogleReviewSMS(input: $input)
  }
`
