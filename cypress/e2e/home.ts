/// <reference types="../support/index" />
/// <reference types="cypress" />
/// <reference types="@types/testing-library__cypress" />
// import { render, cleanup } from 'react-testing-library'
describe(`example`, () => {
  it(`contains keyword`, () => {
    cy.visit(`/`)
    cy.findByText(/say: hello!/i).should('exist')
  })
})
