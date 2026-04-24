import { loginManager } from "../../../services/auth.service"
import { chooseCorrectCompany, getAllGameRequests, activateCustomerGame, updateCustomerGameData
} from "../../../services/manager.service"

describe("Game Requests - Cleanup", () => {
  let testData
  let managerToken
  let selectedGame
  let gameRequests
  let pendingRequest

  beforeEach(() => {
    const env = Cypress.env("env") || "qa"

          cy.fixture(`testData.${env}`).then((data) => {
            testData = data
          })

        selectedGame = testData.games.find(
          game => game.id === testData.selectedGameId
        )

        expect(selectedGame).to.exist

        return loginManager(testData)
      })
      .then((loginResponse) => {
        expect(loginResponse.status).to.eq(201)
        expect(loginResponse.body.data.token).to.exist

        managerToken = loginResponse.body.data.token

       return chooseCorrectCompany(testData, managerToken)
       })
       .then((changeCompanyResponse) => {
         expect(changeCompanyResponse.status).to.eq(201)
         expect(changeCompanyResponse.body.data.token).to.exist

         managerToken = changeCompanyResponse.body.data.token

        return getAllGameRequests(testData, managerToken)
      })
      .then((requests) => {
        gameRequests = requests

        pendingRequest = gameRequests.find(request =>
          request.customerUsername === testData.customer.username &&
          request.companyId === testData.companyId &&
          request.gameCompanyId &&
          request.gameCompanyId._id === selectedGame.gamesCompanyId &&
          request.status === "Pending"
        )
      })
  })

  it("Encuentra el Game Request pendiente del customer", () => {
    expect(pendingRequest).to.exist

    cy.log(`Game Request encontrado: ${pendingRequest._id}`)
    cy.log(`Estado: ${pendingRequest.status} - ${pendingRequest.state}`)
  })

  it("Procesa el Game Request pendiente del customer", () => {
    expect(pendingRequest).to.exist

    let action

    if (pendingRequest.state === "Creating") {
      action = updateCustomerGameData(testData, managerToken, pendingRequest._id)
        .then((updateResponse) => {
          expect(updateResponse.status).to.eq(200)
          expect(updateResponse.body.status).to.eq(200)
          expect(updateResponse.body.message).to.eq("Game updated")

          expect(updateResponse.body.data.gameMobileId).to.eq(testData.gameRequest.gameMobileId)
          expect(updateResponse.body.data.kiosk).to.eq(testData.gameRequest.kiosk)
          expect(updateResponse.body.data.amount).to.eq(testData.gameRequest.amount)

          return activateCustomerGame(testData, managerToken, pendingRequest._id)
        })
    } else {
      action = activateCustomerGame(testData, managerToken, pendingRequest._id)
    }

    action.then((activateResponse) => {
      expect(activateResponse.status).to.eq(200)
      expect(activateResponse.body.status).to.eq(200)
      expect(activateResponse.body.message).to.eq("Game updated")

      expect(activateResponse.body.data._id).to.eq(pendingRequest._id)
      expect(activateResponse.body.data.status).to.eq("Active")
      expect(activateResponse.body.data.state).to.eq("Active")

      cy.log(`Game Request procesado: ${activateResponse.body.data.gameMobileId}`)
    })
  })
})