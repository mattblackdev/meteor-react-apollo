import { TodoService } from 'todos/server/services'

export default {
  Query: {
    todos: (_, args, ctx, ast) => {
      return TodoService.readTodos(ast)
    },
  },
  Mutation: {
    createTodo: (_, { input }, ctx, ast) => {
      return TodoService.createTodo(input, ast)
    },
    deleteTodo: (_, { input: { _id } }, ctx, ast) => {
      return TodoService.deleteTodo(_id, ast)
    },
  },
}
