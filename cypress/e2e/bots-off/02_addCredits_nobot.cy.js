import { loginCustomer } from "../../services/auth.service"
import { getCustomerGames, addCreditsFromCustomer} from "../../services/game.service"

describe("Add Credits - Customer sin bot", () => {
  let testData
  let customerToken

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Agregar créditos a un game sin bot", () => {
    const selectedGame = testData.games.find(
      game => game.id === testData.selectedGameId
    )

    expect(selectedGame).to.exist
    expect(selectedGame.gamesCompanyId).to.exist

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
        expect(gamesResponse.body.data.length).to.be.greaterThan(0)

        const gameClient = gamesResponse.body.data.find(
          game =>
            game.gameCompanyId._id === selectedGame.gamesCompanyId &&
            game.companyId === testData.companyId
        )

        expect(gameClient).to.exist

        return addCreditsFromCustomer(testData, customerToken, gameClient)
      })
      .then((addCreditsResponse) => {
        expect(addCreditsResponse.status).to.eq(201)
        expect(addCreditsResponse.body.data).to.exist

      })
  })
})