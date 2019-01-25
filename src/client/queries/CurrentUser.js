import gql from 'graphql-tag'

export default gql`
  query CurrentUser {
    currentUser {
      profile {
        name
      }
      emails {
        address
      }
    }
  }
`
