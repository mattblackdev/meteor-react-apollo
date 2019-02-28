/* global Assets */
import { Meteor } from 'meteor/meteor'
if (Meteor.isDevelopment) {
  let path
  try {
    path = Assets.absoluteFilePath('.env')
  } catch(e) {
    console.warn('Could not configure environment variables via dotenv.')
    console.warn('Create an .env file in the /private folder.')
  }
  require('dotenv').config({
    path
  })
}

import { initialize } from 'meteor/cultofcoders:apollo'
import 'users/server'
import 'todos/server'
import './seed'
initialize()
