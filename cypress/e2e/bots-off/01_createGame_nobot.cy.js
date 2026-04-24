import { loginCustomer } from "../../services/auth.service"
import { createGameFromCustomer } from "../../services/game.service"

describe("Create Game - Customer sin bot", () => {
  let testData
  let customerToken

  beforeEach(() => {
      const env = Cypress.env("env") || "qa"

      cy.fixture(`testData.${env}`).then((data) => {
        testData = data
      })
    })

  it("Crear game para customer sin bot", () => {
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
      .then((createGameResponse) => {
        expect(createGameResponse.status).to.eq(201)
        expect(createGameResponse.body.status).to.eq(200)
        expect(createGameResponse.body.message).to.eq("Game client created")
        expect(createGameResponse.body.data).to.exist
        expect(createGameResponse.body.data.length).to.be.greaterThan(0)

        const createdGame = createGameResponse.body.data[0]

        expect(createdGame.companyId).to.eq(testData.companyId)
        expect(createdGame.gameCompanyId._id).to.eq(selectedGame.gamesCompanyId)
        expect(createdGame.customerUsername).to.eq(testData.customer.username)

        expect(createdGame.status).to.eq("Pending")
        expect(createdGame.state).to.eq("Creating")
      })
  })
})