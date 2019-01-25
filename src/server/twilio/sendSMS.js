import { Meteor } from 'meteor/meteor'
import twilio from 'twilio'

let client

Meteor.startup(() => {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
})

export default function sendSMS({ to, body }) {
  return client.messages.create({
    from: process.env.TWILIO_NUMBER,
    body,
    to,
  })
}
