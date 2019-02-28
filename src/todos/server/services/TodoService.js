export default class TodoService {
  constructor({ collection }) {
    this.collection = collection
  }

  createTodo(todo, ast) {
    const _id = this.collection.insert(todo)
    if (!_id) throw new Error('Could not create todo')

    return this.collection
      .astToQuery(ast, {
        $filters: { _id },
      })
      .fetchOne()
  }

  readTodos(ast) {
    return this.collection.astToQuery(ast).fetch()
  }

  deleteTodo(_id, ast) {
    const todo = this.collection
      .astToQuery(ast, {
        $filters: { _id },
      })
      .fetchOne()

    const numberRemoved = this.collection.remove({ _id })
    if (!numberRemoved) throw new Error('Could not delete todo')

    return todo
  }
}
