import React from 'react'
import { render } from 'react-dom'
import { Meteor } from 'meteor/meteor'
import { initialize } from 'meteor/cultofcoders:apollo'
import { onTokenChange } from 'meteor-apollo-accounts'
import { ApolloProvider } from 'react-apollo-hooks'

import App from './App'

const { client } = initialize()

onTokenChange(() => {
  client.resetStore()
})

Meteor.startup(() => {
  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('root'),
  )
})
