/* global Assets */
import dotenv from 'dotenv'
dotenv.config({
  path: Assets.absoluteFilePath('.env'),
})

import { initialize } from 'meteor/cultofcoders:apollo'
import './schema'
import './accounts'
import './seed'
initialize()
