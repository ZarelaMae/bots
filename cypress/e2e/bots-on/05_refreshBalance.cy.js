import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, refreshBalanceFromCustomer } from "../../services/game.service"

describe("Refresh Balance - Bot", () => {
  let testData
  let customerToken

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Refresh balance de un Game Bot existente", () => {

    const selectedGame = testData.games.find(
      game => game.id === testData.selectedGameId
    )
    expect(selectedGame).to.exist

    loginCustomer(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)

        customerToken = loginResponse.body.data.token
        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        const gameClient = gamesResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(gameClient).to.exist

        return refreshBalanceFromCustomer(testData, customerToken, gameClient)
      })
      .then((refreshResponse) => {
        expect(refreshResponse.status).to.eq(201)
          expect(refreshResponse.body.status).to.eq(200)
          expect(refreshResponse.body.message).to.eq("Success")
          expect(refreshResponse.body.data).to.exist

          cy.log("Refresh balance ejecutado correctamente")
      })
  })
})