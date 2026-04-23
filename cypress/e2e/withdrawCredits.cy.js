import { loginCustomer } from "../services/auth.service"
import { getCustomerGames, withdrawCreditsFromCustomer, refreshBalanceFromCustomer } from "../services/game.service"

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

    loginCustomer(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)

        customerToken = loginResponse.body.data.token
        //primera consulta
        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
      expect(gamesResponse.status).to.eq(200)
      expect(gamesResponse.body.data).to.exist
      const gameClient = gamesResponse.body.data.find(
        g => g.gameCompanyId.gameCatalogId.name === testData.game.expectedName
      )
      expect(gameClient).to.exist

        // Refresh balance
        return refreshBalanceFromCustomer(testData, customerToken, gameClient)
      })
      .then((refreshResponse) => {
      expect(refreshResponse.status).to.eq(201)
      expect(refreshResponse.body.status).to.eq(200)
      expect(refreshResponse.body.message).to.eq("Success")

        //volver a consultar actualizado
        return getCustomerGames(testData, customerToken)
      })
      .then((gamesResponse) => {
        const gameClient = gamesResponse.body.data.find(
          g => g.gameCompanyId.gameCatalogId.name === testData.game.expectedName
        )

        expect(gameClient).to.exist
        previousAmount = gameClient.amount

        // saldo suficiente
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