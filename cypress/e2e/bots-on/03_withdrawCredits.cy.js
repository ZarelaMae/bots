import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, withdrawCreditsFromCustomer, refreshBalanceFromCustomer } from "../../services/game.service"

describe("Withdraw Credits - Customer", () => {
  let testData
  let customerToken

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Withdraw Credits de un Game existente", () => {
    let previousAmount

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

        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        const gameClient = gamesResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(gameClient).to.exist
        previousAmount = gameClient.amount

        expect(previousAmount).to.be.at.least(testData.withdrawCredits.amount)

        return withdrawCreditsFromCustomer(testData, customerToken, gameClient)
      })
      .then((withdrawResponse) => {
        expect(withdrawResponse.status).to.eq(201)
        expect(withdrawResponse.body.status).to.eq(200)
        expect(withdrawResponse.body.message).to.eq("Success")

        const newAmount = withdrawResponse.body.data.clientGame.amount

        expect(newAmount).to.eq(previousAmount - testData.withdrawCredits.amount)
      })
  })
})