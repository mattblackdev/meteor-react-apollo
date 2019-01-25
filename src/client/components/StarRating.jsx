import React, { Fragment } from 'react'
import Icon from '@material-ui/core/Icon'
import Star from '@material-ui/icons/Star'
import StarBorder from '@material-ui/icons/StarBorder'
import StarHalf from '@material-ui/icons/StarHalf'
import times from 'lodash/times'

export default function StarRating({
  total = 5,
  rating = 0,
  size = 'inherit',
}) {
  const stars = times(total, i => {
    if (i < rating && i > rating - 1) return <StarHalf />
    if (i < rating) return <Star />
    return <StarBorder />
  })
  return (
    <Fragment>
      {stars.map((star, key) => (
        <Icon key={key} color="secondary" fontSize={size}>
          {star}
        </Icon>
      ))}
    </Fragment>
  )
}
