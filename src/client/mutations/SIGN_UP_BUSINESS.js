import gql from 'graphql-tag'

export default gql`
  mutation SignUpBusiness($input: SignUpBusinessInput!) {
    signUpBusiness(input: $input) {
      _id
      slug
    }
  }
`
