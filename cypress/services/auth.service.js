export function loginCustomer(testData) {
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/customer/authentication/login`,
    body: {
      companyId: testData.companyId,
      emailOrUsername: testData.customer.emailOrUsername,
      password: testData.customer.password
    }
  })
}

export function loginManager(testData){
  return cy.request({
    method: "POST",
    url: `${testData.apiUrl}/api/authentication/login/backend`,
    body: {
      username: testData.admin.username,
      password: testData.admin.password
    }
  })
}