import { BitlyClient } from 'bitly'
import { Meteor } from 'meteor/meteor'

let bitly

Meteor.startup(() => {
  bitly = new BitlyClient(process.env.BITLY_AUTH_TOKEN, {})
})

export default async function createLink(link) {
  try {
    const { url, hash, long_url } = await bitly.shorten(link)
    return { url, hash, long_url }
    // {
    //   url: 'http://bit.ly/2AVk6Vk',
    //   hash: '2AVk6Vk',
    //   global_hash: '3hDSUb',
    //   long_url: 'http://www.example.com/',
    //   new_hash: 1,
    // }
  } catch (e) {
    console.error(e, link)
    throw new Error(`Could not create short link: ${e.message}`)
  }
}
