import { loginCustomer } from "../../services/auth.service"
import { createGameFromCustomer, getCustomerGames } from "../../services/game.service"

describe("Create Game - Customer", () => {
  let testData
  let customerToken

  beforeEach(() => {
    const env = Cypress.env("env") || "qa"

    cy.fixture(`testData.${env}`).then((data) => {
      testData = data
    })
  })

  it("Crear Game correctamente", () => {
    const selectedGame = testData.games.find(
      game => game.id === testData.selectedGameId
    )
    expect(selectedGame).to.exist

    loginCustomer(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)
        expect(loginResponse.body.data.token).to.exist

        customerToken = loginResponse.body.data.token

        return createGameFromCustomer(testData, customerToken, selectedGame)
      })
      .then((createResponse) => {
        expect(createResponse.status).to.eq(201)
        expect(createResponse.body.message).to.eq("Game client created")
        expect(createResponse.body.data).to.exist
        expect(createResponse.body.data).to.have.length.greaterThan(0)

        const gameClient = createResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(gameClient).to.exist
        expect(gameClient._id).to.exist
        expect(gameClient.customerUsername).to.eq(testData.customer.username)
        expect(gameClient.companyId).to.eq(testData.companyId)
        expect(gameClient.status).to.eq("Active")
        expect(gameClient.state).to.eq("Active")
        expect(gameClient.createdBy).to.eq("BOT-V3")
        expect(gameClient.gameCompanyId._id).to.eq(selectedGame.gamesCompanyId)
        expect(gameClient.gameCompanyId.gameCatalogId.name).to.eq(selectedGame.expectedName)

        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        expect(gamesResponse.status).to.eq(200)
        expect(gamesResponse.body.data).to.exist
        expect(gamesResponse.body.data.length).to.be.greaterThan(0)

        const createdGame = gamesResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(createdGame).to.exist
        expect(createdGame._id).to.exist
        expect(createdGame.customerUsername).to.eq(testData.customer.username)
        expect(createdGame.companyId).to.eq(testData.companyId)
        expect(createdGame.status).to.eq("Active")
        expect(createdGame.state).to.eq("Active")
        expect(createdGame.gameCompanyId._id).to.eq(selectedGame.gamesCompanyId)
        expect(createdGame.gameCompanyId.gameCatalogId.name).to.eq(selectedGame.expectedName)
      })
  })
})