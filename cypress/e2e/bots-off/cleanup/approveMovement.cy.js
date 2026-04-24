import { loginManager } from "../../../services/auth.service"
import { chooseCorrectCompany } from "../../../services/manager.service"
import { getPendingMovementsFromManager, approveMovementByManager } from "../../../services/operations.service"

describe("Approve Movement", () => {
  let testData
  let managerToken
  let movementId

  beforeEach(() => {
    cy.fixture("testData").then((data) => {
      testData = data
    })
  })

  it("Aprobar movimiento pendiente", () => {
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

        return approveMovementByManager(
          testData,
          managerToken,
          movementId
        )
      })
      .then((approveResponse) => {
        expect(approveResponse.status).to.eq(200)
        expect(approveResponse.body.data.status).to.eq("Approved")
      })
  })
})