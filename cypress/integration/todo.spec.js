describe('Todo Form', function() {
  it('Does not do much!', function() {
    expect(true).to.equal(true)
  })
  it('Creates a todo', function() {
    cy.visit('/')
    cy.contains('Description')
      .get('input')
      .type('Walk the dog')
    cy.get('button[type="submit"]').click()
    cy.get('#todoList').contains('Walk the dog')
  })
  it('Deletes a todo', function() {
    cy.contains('Walk the dog')
      .get('button[data-test-id="delete-todo"]')
      .click({ multiple: true })
    cy.get('#todoList')
      .contains('Walk the dog')
      .should('not.exist')
  })
})
