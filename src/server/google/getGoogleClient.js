import { createClient } from '@google/maps'

let client

export default function getClient() {
  if (!client) {
    client = createClient({
      key: process.env.GOOGLE_API_KEY,
    })
  }
  return client
}
