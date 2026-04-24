export function getPendingMovementsFromManager(testData, managerToken) {
  return cy.request({
    method: "GET",
    url: `${testData.apiUrl}/api/movements/find-list-pending/paginated`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    qs: {
      page: 1,
      pageSize: 20
    }
  })
}

export function approveMovementByManager(testData, managerToken, movementId) {
  return cy.request({
    method: "PUT",
    url: `${testData.apiUrl}/api/movements/approved-movement`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    body: {
      _id: movementId,
      managerUsername: testData.admin.username
    }
  })
}

export function cancelMovementByManager(testData, managerToken, movementId, reason = "test") {
  return cy.request({
    method: "PUT",
    url: `${testData.apiUrl}/api/movements/cancel-movement`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    body: {
      _id: movementId,
      managerUsername: testData.admin.username,
      reason: reason
    },
    failOnStatusCode: false
  })
}