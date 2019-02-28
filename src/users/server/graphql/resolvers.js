export default {
  Query: {
    users: (_, args, ctx, ast) => {
      return ctx.db.users.astToQuery(ast).fetch()
    },
  },
}
