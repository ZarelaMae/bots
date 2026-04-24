import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, addCreditsFromCustomer } from "../../services/game.service"

describe("Add Credits - Customer", () => {
  let testData
  let customerToken

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("ADD Credits a un Game existente con Bot", () => {
    let previousAmount

    const selectedGame = testData.games.find(
      game => game.id === testData.selectedGameId
    )
    expect(selectedGame).to.exist

    loginCustomer(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)

        customerToken = loginResponse.body.data.token
        expect(customerToken).to.exist

        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        expect(gamesResponse.status).to.eq(200)
        expect(gamesResponse.body.data).to.exist

        const gameClient = gamesResponse.body.data.find(
          g => g.gameCompanyId._id === selectedGame.gamesCompanyId
        )

        expect(gameClient).to.exist
        previousAmount = gameClient.amount

        return addCreditsFromCustomer(testData, customerToken, gameClient)
      })
      .then((addCreditsResponse) => {
        expect(addCreditsResponse.status).to.eq(201)
        expect(addCreditsResponse.body.status).to.eq(200)
        expect(addCreditsResponse.body.message).to.eq("Success")

        const data = addCreditsResponse.body.data
        expect(data).to.exist
        expect(data.amountInGames).to.be.a("number")
        expect(data.amountInPlatform).to.be.a("number")

        const clientGame = data.clientGame
        expect(clientGame._id).to.exist
        expect(clientGame.gameMobileId).to.exist
        expect(clientGame.status).to.eq("Active")
        expect(clientGame.gameCompanyId._id).to.eq(selectedGame.gamesCompanyId)

        const newAmount = clientGame.amount
        expect(newAmount).to.eq(previousAmount + testData.addCredits.amount)
      })
  })
})