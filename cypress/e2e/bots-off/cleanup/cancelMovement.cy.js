import { loginManager } from "../../../services/auth.service"
import { chooseCorrectCompany } from "../../../services/manager.service"
import { getPendingMovementsFromManager, cancelMovementByManager } from "../../../services/operations.service"

describe("Cancel Movement", () => {
  let testData
  let managerToken
  let movementId

  beforeEach(() => {
      const env = Cypress.env("env") || "qa"

      cy.fixture(`testData.${env}`).then((data) => {
        testData = data
      })
    })

  it("Cancelar movimiento pendiente", () => {
    loginManager(testData)
      .then((loginResponse) => {
        const adminToken = loginResponse.body.data.token
        return chooseCorrectCompany(testData, adminToken)
      })
      .then((companyResponse) => {
        managerToken = companyResponse.body.data.token

        return getPendingMovementsFromManager(testData, managerToken)
      })
      .then((movementsResponse) => {
        expect(movementsResponse.status).to.eq(200)
        expect(movementsResponse.body.data.documents).to.exist

        const movements = movementsResponse.body.data.documents

        const pendingMovement = movements.find(m =>
          m.status === "Pending" &&
          m.companyId === testData.companyId &&
          m.customerUsername === testData.customer.username
        )

        expect(pendingMovement).to.exist

        movementId = pendingMovement._id

        return cancelMovementByManager(
          testData,
          managerToken,
          movementId,
          "test"
        )
      })
      .then((cancelResponse) => {
        expect(cancelResponse.status).to.eq(200)
        expect(cancelResponse.body.data.status).to.eq("Canceled")
        expect(cancelResponse.body.data.message).to.eq("test")
      })
  })
})