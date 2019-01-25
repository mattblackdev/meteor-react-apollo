import getClient from './getGoogleClient'

export default function getPlaceId(search) {
  return new Promise((resolve, reject) => {
    getClient().findPlace(
      { input: search, inputtype: 'textquery' },
      (err, response) => {
        if (
          !err &&
          response &&
          response.json &&
          response.json.candidates &&
          response.json.candidates.length &&
          response.json.candidates[0].place_id
        ) {
          resolve(response.json.candidates[0].place_id) // TODO: Handle other scenarios
        } else {
          console.log(err || response)
          reject('Could not determine Place Id')
        }
      },
    )
  })
}
