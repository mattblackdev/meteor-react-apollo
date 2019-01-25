import getClient from './getGoogleClient'

export default function getPlaceDetails(placeid, callback) {
  getClient().place({ placeid }, (err, response) => {
    const result = {
      googleRating: null,
      googleReviews: [],
    }
    if (!err && response && response.json && response.json.result) {
      result.googleRating = response.json.result.rating
      result.googleReviews = response.json.result.reviews
    }
    callback(undefined, result) // TODO: Handle other scenarios
  })
}
