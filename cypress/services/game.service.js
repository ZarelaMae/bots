export function createGameFromCustomer(testData, customerToken, selectedGame) {
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/game-client/by-self/array`,
    headers: {
      Authorization: `Bearer ${customerToken}`
    },
    failOnStatusCode: false,
    body: {
      username: testData.customer.username,
      gamesCompanyId: [selectedGame.gamesCompanyId]
    }
  })
}

export function getCustomerGames(testData, customerToken) {
  return cy.request({
    method: "GET",
    url: `${testData.apiUrl}/api/game-client/by-self`,
    headers: {
      Authorization: `Bearer ${customerToken}`
    },
    failOnStatusCode: false
  })
}

export function addCreditsFromCustomer(testData, customerToken, gameClient) {
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/movements/by-customer`,
    headers: {
      Authorization: `Bearer ${customerToken}`
    },
    failOnStatusCode: false,
    body: {
      amount: testData.addCredits.amount,
      gameName: gameClient.gameCompanyId.gameCatalogId.name,
      type: testData.addCredits.type,
      gameMobileId: gameClient.gameMobileId,
      gameClientId: gameClient._id,
      timeZone: testData.addCredits.timeZone
    }
  })
}

export function withdrawCreditsFromCustomer(testData, customerToken, gameClient) {
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/movements/by-customer`,
    headers: {
      Authorization: `Bearer ${customerToken}`
    },
    failOnStatusCode: false,
    body: {
      amount: testData.withdrawCredits.amount,
      gameName: gameClient.gameCompanyId.gameCatalogId.name,
      type: testData.withdrawCredits.type,
      gameMobileId: gameClient.gameMobileId,
      gameClientId: gameClient._id,
      timeZone: testData.withdrawCredits.timeZone
    }
  })
}

export function refreshBalanceFromCustomer(testData, customerToken, gameClient) {
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/game-client/update-data`,
    headers: {
      Authorization: `Bearer ${customerToken}`
    },
    failOnStatusCode: false,
    body: {
      gameClientId: gameClient._id,
      mobileId: gameClient.gameMobileId,
      nameGame: gameClient.gameCompanyId.gameCatalogId.name
    }
  })
}

export function resetPasswordCustomer(testData, customerToken, gameClientId) {
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/game-client/reset-password`,
    headers: {
      Authorization: `Bearer ${customerToken}`
    },
    body: {
      _id: gameClientId
    },
    failOnStatusCode: false
  })
}