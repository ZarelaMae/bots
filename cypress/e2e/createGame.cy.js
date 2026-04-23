import { loginCustomer } from "../services/auth.service"
import { createGameFromCustomer, getCustomerGames } from "../services/game.service"

describe("Create Game - Customer", () => {
  let testData
  let customerToken

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Crear Game correctamente", () => {
    loginCustomer(testData).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200)

      customerToken = loginResponse.body.data.token
      expect(customerToken).to.exist

      return createGameFromCustomer(testData, customerToken)
    }).then((createResponse) => {
      expect(createResponse.status).to.eq(201)
      expect(createResponse.body.message).to.eq("Game client created")
      expect(createResponse.body.data).to.have.length.greaterThan(0)

      const gameClient = createResponse.body.data[0]

      expect(gameClient.customerUsername).to.eq(testData.customer.username)
      expect(gameClient.companyId).to.eq(testData.companyId)
      expect(gameClient.status).to.eq("Active")
      expect(gameClient.state).to.eq("Active")
      expect(gameClient.createdBy).to.eq("BOT-V3")
      expect(gameClient.gameCompanyId._id).to.eq(testData.game.gamesCompanyId)
      expect(gameClient.gameCompanyId.gameCatalogId.name).to.eq(testData.game.expectedName)

      return getCustomerGames(testData, customerToken)
    }).then((gamesResponse) => {
      expect(gamesResponse.status).to.eq(200)
      expect(gamesResponse.body.data).to.exist
    })
  })
})