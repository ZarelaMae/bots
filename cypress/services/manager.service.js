export function findCustomerByManager(testData, managerToken) {
  return cy.request({
    method: "GET",
    url: `${testData.apiUrl}/api/customer-v2/paginated`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    qs: {
      page: 1,
      pageSize: 50,
      selectType: "email",
      value: testData.customer.emailOrUsername,
      timeZone: testData.admin.timeZone
    }
  })
}

export function getCustomerGamesFromManager(testData, managerToken, customerId) {
  return cy.request({
    method: "GET",
    url: `${testData.apiUrl}/api/game-client/find-by-customer-id/${customerId}`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    failOnStatusCode: false
  })
}

export function updateCustomerGameAmountFromManager(testData, managerToken, gameClientId, gameMobileId, kiosk, manualAmount) {
  return cy.request({
    method: "PATCH",
    url: `${testData.apiUrl}/api/game-client/${gameClientId}`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    body: {
      gameMobileId,
      amount: manualAmount,
      kiosk
    },
    failOnStatusCode: false
  })
}