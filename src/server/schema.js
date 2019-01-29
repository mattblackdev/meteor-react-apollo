import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Accounts } from 'meteor/accounts-base'
import { Mongo } from 'meteor/mongo'
import { load } from 'graphql-load'
import speakingurl from 'speakingurl'
import shortid from 'shortid'

import typeDefs from './typeDefs'
import sendSMS from './twilio/sendSMS'
import createLink from './bitly/createLink'
import getPlaceId from './google/getPlaceId'
import getPlaceDetails from './google/getPlaceDetails'
import { GOOGLE_PLACE_ID_URL } from './constants'

const Businesses = new Mongo.Collection('businesses')
Businesses.addReducers({
  currentUserRole: {
    body: { userLinks: { _id: 1, role: 1 } },
    reduce({ userLinks }, { userId }) {
      if (!userId) return
      const user = userLinks.find(({ _id }) => _id === userId)
      if (user) return user.role
    },
  },
  reviewDetails: {
    body: { googlePlaceId: 1 },
    async reduce({ googlePlaceId }) {
      const result = Meteor.wrapAsync(getPlaceDetails)(googlePlaceId) // TODO: handle error
      return result
    },
  },
})

load({
  typeDefs,
  resolvers: {
    Query: {
      users: () => [{ email: 'some user' }],
      currentUser: (_, args, ctx, ast) => {
        if (ctx.userId) {
          return ctx.db.users
            .astToQuery(ast, {
              $filters: {
                _id: ctx.userId,
              },
            })
            .fetchOne()
        }
      },
      businesses: (_, args, ctx, ast) => {
        if (!ctx.userId) return []
        const query = ctx.db.businesses.astToQuery(ast, {
          $filters: {
            'userLinks._id': ctx.userId,
          },
        })
        query.params.userId = ctx.userId // injects userId into the currentUserRole reducer
        return query.fetch()
      },
      businessBySlug: (_, { slug }, ctx, ast) => {
        if (!ctx.userId) return
        const query = ctx.db.businesses.astToQuery(ast, {
          $filters: {
            'userLinks._id': ctx.userId,
            slug,
          },
        })
        query.params.userId = ctx.userId // injects userId into the currentUserRole reducer
        return query.fetchOne()
      },
    },
    Mutation: {
      sendText: async (
        _,
        {
          input: { businessId, templateId, name, phone, email, message, when },
        },
        ctx,
        ast,
      ) => {
        if (!ctx.userId) throw new Error('Not authorized')
        // TODO: Sanatize & validate input
        const selector = {
          _id: businessId,
          userLinks: {
            $elemMatch: {
              _id: ctx.userId,
              role: { $in: ['OWNER', 'PARTNER', 'ADMIN'] },
            },
          },
          'smsTemplates._id': templateId,
        }

        let business = ctx.db.businesses.findOne(selector)
        if (!business) throw new Error('Could not find business')

        return ctx.db.businesses
          .astToQuery(ast, {
            $filters: { _id: businessId },
          })
          .fetchOne()
      },
      sendGoogleReviewSMS: async (
        _,
        { input: { name, phone, email } },
        ctx,
      ) => {
        console.log('sending google review sms message to ', name, phone)

        // ctx.db.customers.insert({
        //   name,
        //   phone,
        //   email,
        // console.log(ctx.db.businesses)
        // })

        try {
          const messageResult = await sendSMS({
            to: phone,
            body: `Hi ${name}! Thanks so much for choosing Erby Digital. Please tap this link to let us know how we're doing. https://bitly.com/`,
          })
          console.log(messageResult)

          return true
        } catch (e) {
          console.log('Error', e.message)
          return false
        }
      },
      signUpBusiness: async (_, { input }, { db, userId }, ast) => {
        console.log('sign up business input', input)
        if (!userId && !input.owner)
          throw new Error(
            'You must be logged in or provide business owner information',
          )

        const userLinks = []
        let ownerUserId
        if (input.owner) {
          const { name, email, phone, password } = input.owner
          try {
            ownerUserId = Accounts.createUser({
              email,
              password,
              profile: {
                name,
                phone,
              },
            })
          } catch (e) {
            // TODO: Handle multiple businesses for the same owner
            console.log(e)
            throw new Error(
              'Sorry, there was a problem creating the business owner account.',
            )
          }
          if (userId) {
            userLinks.push({ _id: userId, role: 'PARTNER' })
          }
        } else {
          ownerUserId = userId
        }

        userLinks.push({
          _id: ownerUserId,
          role: 'OWNER',
        })

        const slug = `${speakingurl(input.name)}-${shortid.generate()}`
        // TODO: Include Address in the place id search and make sure we have the right one, also check for duplicates
        const googlePlaceId = await getPlaceId(input.name)
        const googleReviewUrl = GOOGLE_PLACE_ID_URL + googlePlaceId
        const googleReviewShortLink = await createLink(googleReviewUrl)

        const defaultSmsTemplate = {
          _id: Random.id(),
          name: 'Google Review Request',
          template: `Hi [Customer Name]! Thanks so much for choosing ${
            input.name
          }. Please tap this link to let us know how we're doing. [Google Review Link]`,
          default: true,
        } // TODO: handle the case that business name makes the text too long

        const { name, address } = input
        const business = {
          name,
          address,
          userLinks,
          slug,
          googlePlaceId,
          googleReviewShortLink,
          customers: [],
          smsTemplates: [defaultSmsTemplate],
        }
        const _id = db.businesses.insert(business)
        const doc = db.businesses
          .astToQuery(ast, { $filters: { _id } })
          .fetchOne()
        return doc
      },
      createSmsTemplate(_, { input }, ctx, ast) {
        if (!ctx.userId) throw new Error('Not authorized')
        // TODO: Sanatize & validate input
        const selector = {
          _id: input.businessId,
          userLinks: {
            $elemMatch: {
              _id: ctx.userId,
              role: { $in: ['OWNER', 'PARTNER'] },
            },
          },
        }
        // TODO: Handle error (and updateResult === 0 )
        const updateResult = ctx.db.businesses.update(selector, {
          $push: {
            smsTemplates: {
              _id: Random.id(),
              name: input.name,
              template: input.template,
              default: false,
            },
          },
        })
        if (!updateResult) throw new Error('Template could not be created')

        // TODO: Check read permissions?
        return ctx.db.businesses
          .astToQuery(ast, { $filters: { _id: input.businessId } })
          .fetchOne()
      },
      updateSmsTemplate(_, { input }, ctx, ast) {
        if (!ctx.userId) throw new Error('Not authorized')
        // TODO: Sanatize & validate input
        const selector = {
          _id: input.businessId,
          userLinks: {
            $elemMatch: {
              _id: ctx.userId,
              role: { $in: ['OWNER', 'PARTNER'] },
            },
          },
          'smsTemplates._id': input._id,
        }
        // TODO: Handle error (and updateResult === 0 )
        const updateResult = ctx.db.businesses.update(selector, {
          $set: {
            'smsTemplates.$.name': input.name,
            'smsTemplates.$.template': input.template,
          },
        })
        if (!updateResult) throw new Error('Template could not be updated')

        // TODO: Check read permissions?
        return ctx.db.businesses
          .astToQuery(ast, { $filters: { _id: input.businessId } })
          .fetchOne()
      },
      setDefaultSmsTemplate(_, { input }, ctx, ast) {
        if (!ctx.userId) throw new Error('Not authorized')
        // TODO: Sanatize & validate input
        const commonSelector = {
          _id: input.businessId,
          userLinks: {
            $elemMatch: {
              _id: ctx.userId,
              role: { $in: ['OWNER', 'PARTNER'] },
            },
          },
        }
        const currentDefaultSelector = {
          ...commonSelector,
          'smsTemplates.default': true,
        }
        const updateDefaultSelector = {
          ...commonSelector,
          'smsTemplates._id': input._id,
        }

        // Set all templates' default flag to false
        ctx.db.businesses.update(
          currentDefaultSelector,
          {
            $set: {
              'smsTemplates.$.default': false,
            },
          },
          { multi: true }, // TODO: Is this necesarry? probably not
        )

        // Then set this one to true
        const updateResult = ctx.db.businesses.update(updateDefaultSelector, {
          $set: {
            'smsTemplates.$.default': true,
          },
        })
        if (!updateResult) throw new Error('Template could not be updated')

        // TODO: Check read permissions?
        return ctx.db.businesses
          .astToQuery(ast, { $filters: { _id: input.businessId } })
          .fetchOne()
      },
      deleteSmsTemplate(_, { input }, ctx, ast) {
        if (!ctx.userId) throw new Error('Not authorized')
        // TODO: Sanatize & validate input
        const selector = {
          _id: input.businessId,
          userLinks: {
            $elemMatch: {
              _id: ctx.userId,
              role: { $in: ['OWNER', 'PARTNER'] },
            },
          },
          'smsTemplates._id': input._id,
        }
        // TODO: Handle error (and updateResult === 0 )
        const updateResult = ctx.db.businesses.update(selector, {
          $pull: {
            smsTemplates: { _id: input._id },
          },
        })
        if (!updateResult) throw new Error('Template could not be removed')

        // TODO: Check read permissions?
        return ctx.db.businesses
          .astToQuery(ast, { $filters: { _id: input.businessId } })
          .fetchOne()
      },
    },
  },
})
