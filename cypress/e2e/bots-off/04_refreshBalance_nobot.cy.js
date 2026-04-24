import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, refreshBalanceFromCustomer } from "../../services/game.service"

describe("Refresh Balance - Customer Game", () => {
  let testData
  let customerToken

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Refresh balance de un Game sin bot", () => {
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

        return refreshBalanceFromCustomer(testData, customerToken, gameClient)
      })
      .then((refreshResponse) => {
        expect(refreshResponse.status).to.eq(201)
        expect(refreshResponse.body.status).to.eq(200)
        expect(refreshResponse.body.message).to.eq("Success")

        expect(refreshResponse.body.data).to.exist
        expect(refreshResponse.body.data._id).to.exist
        expect(refreshResponse.body.data.gameMobileId).to.exist
        expect(refreshResponse.body.data.gameCompanyId).to.exist

        expect(refreshResponse.body.data.status).to.eq("Pending")
        expect(refreshResponse.body.data.state).to.eq("Updating")

      })
  })
})