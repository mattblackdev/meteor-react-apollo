/* global Assets */
import { Meteor } from 'meteor/meteor'
if (Meteor.isDevelopment) {
  require('dotenv').config({
    path: Assets.absoluteFilePath('.env'),
  })
}

import { initialize } from 'meteor/cultofcoders:apollo'
import 'users/server'
import 'todos/server'
import './seed'
initialize()
