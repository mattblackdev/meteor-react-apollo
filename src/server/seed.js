import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

Meteor.startup(() => {
  Accounts.setPassword('iKLc4kApMLMTKM6og', 'bobsaget')
})
