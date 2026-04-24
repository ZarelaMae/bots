export function chooseCorrectCompany (testData, managerToken){
    return cy.request({
          method: "POST",
          url: `${testData.apiUrl}/api/authentication/change-company/master`,
          headers: {
            Authorization: `Bearer ${managerToken}`
          },
          body: {
            companyId: testData.companyId
          },
          failOnStatusCode: false
        })
}

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

export function deleteGameClientByManager(testData, managerToken, gameClientId) {
  return cy.request({
    method: "DELETE",
    url: `${testData.apiUrl}/api/game-client/${gameClientId}`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    failOnStatusCode: false
  })
}
// cleanGameRequests
export function getGameRequests(testData, managerToken, page = 1, pageSize = 20) {
  return cy.request({
    method: "GET",
    url: `${testData.apiUrl}/api/game-client/find-list-pending/paginated?page=${page}&pageSize=${pageSize}`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    failOnStatusCode: false
  })
}

export function getAllGameRequests(testData, managerToken, pageSize = 20) {
  let allRequests = []

  function getPage(page) {
    return getGameRequests(testData, managerToken, page, pageSize)
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq(200)

        const documents = response.body.data.documents || []
        const total = response.body.data.numberTotalDocuments || 0

        allRequests = allRequests.concat(documents)

        if (allRequests.length < total) {
          return getPage(page + 1)
        }

        return allRequests
      })
  }
  return getPage(1)
}

export function updateCustomerGameData(testData, managerToken, gameClientId) {
  return cy.request({
    method: "PATCH",
    url: `${testData.apiUrl}/api/game-client/${gameClientId}`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    body: {
      gameMobileId: testData.gameRequest.gameMobileId,
      amount: testData.gameRequest.amount,
      kiosk: testData.gameRequest.kiosk
    },
    failOnStatusCode: false
  })
}

export function activateCustomerGame(testData, managerToken, gameClientId) {
  return cy.request({
    method: "PATCH",
    url: `${testData.apiUrl}/api/game-client/${gameClientId}`,
    headers: {
      Authorization: `Bearer ${managerToken}`
    },
    body: {
      status: "Active",
      state: "Active"
    },
    failOnStatusCode: false
  })
}