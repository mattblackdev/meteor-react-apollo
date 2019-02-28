import Todos from 'todos/server/db/todosCollection'
import TodoServiceModel from './TodoService'

export const TodoService = new TodoServiceModel({ collection: Todos })
