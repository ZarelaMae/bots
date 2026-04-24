import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, withdrawCreditsFromCustomer } from "../../services/game.service"

describe("Withdraw Credits - Customer", () => {
  let testData
  let customerToken

  beforeEach(() => {
    const env = Cypress.env("env") || "qa"

    cy.fixture(`testData.${env}`).then((data) => {
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
        cy.wait(5000)
        previousAmount = Number(gameClient.amount)

        cy.log(`Saldo antes: ${previousAmount}`)

        expect(previousAmount).to.be.at.least(testData.withdrawCredits.amount)

        return withdrawCreditsFromCustomer(testData, customerToken, gameClient)
      })
      .then((withdrawResponse) => {
        expect(withdrawResponse.status).to.eq(201)
        expect(withdrawResponse.body.status).to.eq(200)
        expect(withdrawResponse.body.message).to.eq("Success")

        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        const gameAfter = gamesResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(gameAfter).to.exist

        const finalAmount = Number(gameAfter.amount)

        cy.log(`Saldo después: ${finalAmount}`)

        expect(finalAmount).to.eq(
          previousAmount - testData.withdrawCredits.amount)
      })
  })
})