import { useMutation } from 'react-apollo-hooks'

import Todos from 'todos/client/queries/Todos.graphql'
import DeleteTodo from 'todos/client/mutations/DeleteTodo.graphql'

export default function useDeleteTodo() {
  const deleteTodo = useMutation(DeleteTodo)
  return todoId =>
    deleteTodo({
      variables: { input: { _id: todoId } },
      update: (cache, { data: { deleteTodo } }) => {
        const { todos } = cache.readQuery({ query: Todos })
        cache.writeQuery({
          query: Todos,
          data: {
            todos: todos.filter(({ _id }) => _id !== deleteTodo._id),
          },
        })
      },
    })
}
