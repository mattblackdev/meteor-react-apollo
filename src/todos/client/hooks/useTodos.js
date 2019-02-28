import { useQuery } from 'react-apollo-hooks'

import Todos from 'todos/client/queries/Todos.graphql'

export default function useTodos(options) {
  const { data, error, loading } = useQuery(Todos, options)
  const todos = !error && !loading ? data.todos : []
  return {
    todos,
    error,
    loading,
  }
}
