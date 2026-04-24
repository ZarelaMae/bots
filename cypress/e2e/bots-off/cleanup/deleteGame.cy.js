import { loginManager } from "../../../services/auth.service"
import {
  chooseCorrectCompany,
  findCustomerByManager,
  getCustomerGamesFromManager,
  deleteGameClientByManager
} from "../../../services/manager.service"

describe("Cleanup - Delete Game Client sin bot", () => {
  let testData
  let managerToken
  let customerId
  let gameClientId

  beforeEach(() => {
      const env = Cypress.env("env") || "qa"

      cy.fixture(`testData.${env}`).then((data) => {
        testData = data
      })
    })

  it("Eliminar game client de customer sin bot", () => {
    const selectedGameData = testData.games.find(
      game => game.id === testData.selectedGameId
    )

    expect(selectedGameData).to.exist

    loginManager(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(201)

        const adminToken = loginResponse.body.data.token
        return chooseCorrectCompany(testData, adminToken)
      })
      .then((changeCompanyResponse) => {
        expect(changeCompanyResponse.status).to.eq(201)

        managerToken = changeCompanyResponse.body.data.token
        return findCustomerByManager(testData, managerToken)
      })
      .then((customerResponse) => {
        expect(customerResponse.status).to.eq(200)
        expect(customerResponse.body.data).to.exist
        expect(customerResponse.body.data.data).to.exist

        const customers = customerResponse.body.data.data
        expect(customers.length).to.be.greaterThan(0)

       const customer = customers.find(c =>
       c.email === testData.customer.emailOrUsername ||
       c.username === testData.customer.username
       )

       expect(customer).to.exist

       customerId = customer._id
       expect(customerId).to.exist

        return getCustomerGamesFromManager(testData, managerToken, customerId)
      })
      .then((gamesResponse) => {
        expect(gamesResponse.status).to.eq(200)
        expect(gamesResponse.body.data).to.exist

        const selectedGameClient = gamesResponse.body.data.find(
          game =>
            game.gameCompanyId._id === selectedGameData.gamesCompanyId &&
            game.companyId === testData.companyId
        )

        expect(selectedGameClient).to.exist

        gameClientId = selectedGameClient._id

        return deleteGameClientByManager(
          testData,
          managerToken,
          gameClientId
        )
      })
      .then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(200)
        expect(deleteResponse.body.message).to.eq("Deleted successfully")

        return getCustomerGamesFromManager(testData, managerToken, customerId)
      })
      .then((gamesAfterDelete) => {
        const gameStillExists = gamesAfterDelete.body.data.find(
          game => game._id === gameClientId
        )

        expect(gameStillExists).to.not.exist
      })
  })
})