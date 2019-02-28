import { useMutation } from 'react-apollo-hooks'

import CreateTodo from 'todos/client/mutations/CreateTodo.graphql'
import Todos from 'todos/client/queries/Todos.graphql'

export default function useCreateTodo() {
  const createTodo = useMutation(CreateTodo)
  return input =>
    createTodo({
      variables: { input },
      update: (cache, { data: { createTodo } }) => {
        const { todos } = cache.readQuery({ query: Todos })
        cache.writeQuery({
          query: Todos,
          data: { todos: todos.concat([createTodo]) },
        })
      },
    })
}
