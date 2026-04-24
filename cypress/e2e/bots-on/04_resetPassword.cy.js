import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, resetPasswordCustomer } from "../../services/game.service"

describe("Reset Password - Customer Game", () => {
  let testData
  let customerToken

  beforeEach(() => {
      const env = Cypress.env("env") || "qa"

      cy.fixture(`testData.${env}`).then((data) => {
        testData = data
      })
    })

  it("Procesar solicitud de reset password de un Game existente", () => {
    let gameClientId

    const selectedGame = testData.games.find(
      game => game.id === testData.selectedGameId
    )
    expect(selectedGame).to.exist

    loginCustomer(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)
        expect(loginResponse.body.data.token).to.exist

        customerToken = loginResponse.body.data.token

        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        expect(gamesResponse.status).to.eq(200)
        expect(gamesResponse.body.data).to.exist

        const gameClient = gamesResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(gameClient).to.exist

        gameClientId = gameClient._id

        return resetPasswordCustomer(testData, customerToken, gameClientId)
      })
      .then((resetResponse) => {
        expect(resetResponse.status).to.eq(201)
        expect(resetResponse.body.status).to.eq(200)
        expect(resetResponse.body.message).to.eq("Success")
        expect(resetResponse.body.data).to.exist

        const data = resetResponse.body.data

        expect(data._id).to.eq(gameClientId)
        expect(data.customerUsername).to.eq(testData.customer.username)
        expect(data.gameCompanyId._id).to.eq(selectedGame.gamesCompanyId)
        expect(data.gameCompanyId.gameCatalogId.name).to.eq(selectedGame.expectedName)
        expect(data.status).to.eq("Active")
        expect(data.state).to.eq("Active")
        expect(data.gameCompanyId.resetPassword).to.eq(true)
      })
  })
})