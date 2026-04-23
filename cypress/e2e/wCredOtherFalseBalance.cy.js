import { loginManager, loginCustomer } from "../services/auth.service"
import { findCustomerByManager, getCustomerGamesFromManager, updateCustomerGameAmountFromManager
} from "../services/manager.service"
import { getCustomerGames, withdrawCreditsFromCustomer, refreshBalanceFromCustomer  } from "../services/game.service"

describe("Balance changed from Manager", () => {
  let testData

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Error Controlado - Balance changed from Manager", () => {
    let managerToken
    let customerToken
    let customerId
    let gameClientId
    let updatedGame
    const manualAmount = 5

    loginManager(testData)
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(201)
        expect(loginResponse.body.data.token).to.exist

        managerToken = loginResponse.body.data.token

        return findCustomerByManager(testData, managerToken)
      })
      .then((customerResponse) => {
        expect(customerResponse.status).to.eq(200)
        expect(customerResponse.body.data).to.exist
        expect(customerResponse.body.data.data).to.exist
        expect(customerResponse.body.data.data.length).to.be.greaterThan(0)

        const customers = customerResponse.body.data.data

        const customer = customers.find(c =>
            c.email === testData.customer.emailOrUsername ||
            c.username === testData.customer.emailOrUsername
        )
        expect(customer).to.exist

        customerId = customer._id

        expect(customerId).to.exist

        return getCustomerGamesFromManager(testData, managerToken, customerId)
      })
      .then((gamesResponse) => {
        expect(gamesResponse.status).to.eq(200)
        expect(gamesResponse.body.data).to.exist
        expect(gamesResponse.body.data.length).to.be.greaterThan(0)

        const games = gamesResponse.body.data

        const game = games.find(
          g => g.gameCompanyId?.gameCatalogId?.name === testData.game.expectedName
        )
        expect(game).to.exist

        gameClientId = game._id
        expect(gameClientId).to.exist

        const gameMobileId = game.gameMobileId
        const kiosk = game.kiosk
        expect(gameMobileId).to.exist
        expect(kiosk).to.exist

        return updateCustomerGameAmountFromManager(testData, managerToken, gameClientId, gameMobileId, kiosk, manualAmount)
      })
      .then((updateResponse) => {
        expect(updateResponse.status).to.eq(200)
        expect(updateResponse.body.message).to.eq("Game updated")
        expect(updateResponse.body.data).to.exist
        expect(updateResponse.body.data.amount).to.eq(manualAmount)

        return loginCustomer(testData)
      })
      .then((customerLoginResponse) => {
        expect(customerLoginResponse.status).to.eq(200)
        expect(customerLoginResponse.body.data.token).to.exist

        customerToken = customerLoginResponse.body.data.token

        return getCustomerGames(testData, customerToken)
      })
      .then((customerGamesResponse) => {
        expect(customerGamesResponse.status).to.eq(200)
        expect(customerGamesResponse.body.data).to.exist

        updatedGame = customerGamesResponse.body.data.find(
          g => g.gameCompanyId?.gameCatalogId?.name === testData.game.expectedName
        )

        expect(updatedGame).to.exist
        expect(updatedGame.amount).to.eq(manualAmount)

        return withdrawCreditsFromCustomer(testData, customerToken, updatedGame)
      })
      .then((withdrawResponse) => {

        expect(withdrawResponse.status).to.eq(500)
        expect(withdrawResponse.body.message).to.include("Insufficient credit. Refresh balance")
        cy.log(`Response message: ${withdrawResponse.body.message}`)
        return refreshBalanceFromCustomer(testData, customerToken, updatedGame)
        // que permita pasar
        /*expect([200, 201, 500]).to.include(withdrawResponse.status)
        cy.log(`Response message: ${withdrawResponse.body.message}`)

        if (withdrawResponse.status === 500) {
          expect(withdrawResponse.body.message).to.include("Insufficient credit. Refresh balance")
          return refreshBalanceFromCustomer(testData, customerToken, updatedGame)
        }*/
      })
      .then((refreshResponse) => {
        if (!refreshResponse) return
        expect(refreshResponse.status).to.eq(200)
        cy.log(`Refresh executed`)
      })
  })
})