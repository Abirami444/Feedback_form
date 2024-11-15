const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { GoogleAuth } = require('google-auth-library');

// Load your service account credentials
const SERVICE_ACCOUNT_CREDENTIALS = {
  type: "service_account",
  project_id: "feedback-app-440415",
  private_key_id: "787380e707b402905d9b0239b0cb32aebbae14cb",
  private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZs/ZNITDkcFU/\nE+wwjV77vyzfv5B+tMvQJE+5D6mLJkdhvapMdrD7xJdmNrXwqzenAWtp4irAgaap\nBYHUjm8LwqSBg2i3Rwm9DqXG/PcURIolSC4PnnWRX2tWXdOqOxf80UcXkkXO705l\nncC4sxu7Gm/S1iUV37IlloyMdtYezDplUmDbLuMZ/PzKwmqa2oYDID6oDIINylSs\n+bCy+K9rKTyaxfS9HTYCI9xAbxpin9iUoHUrEL7BRbZbeLLwtxwWJKGnFTDsnK0f\n65oq9VRgm0LAXGUav2JptMKa007rbcmzHM/OvAFVD3aLPtXOLIJZIgt5geEFrbgU\nnTXGV73bAgMBAAECggEAEbx5BwR1+l5WD+3SGvYtSDqSyIz39Q8S18Vg57d9dn+n\nzAkRXjpyCNNyLwrQKuHvDZf116WQDl/HpghrJ2Z6PO6sgf9ydXe+kXDfw1sMfeu8\nzzmJiybbZTeQEMrJ8oJYLcXOgNNRt+PYdZRjGU0dvZT642bvp5sFGR5KwKiz46C6\nsow8NJ+SvAcfV87o2uSGssIpv/8Cmqo+VOzuqU3/x5IBUOSWweXj3ar3wgvmQqYz\nNHfAR7A1INRLMJDxlTnCKUCIQ8j5o7NMXRAqBXnm9vC5amdR5mWyVf7dIaTDNUwY\nFLXKtGKslVR/nUHa2BO2Cv26q8Rt72xs6jpLH9DQGQKBgQDHJztN5lC/PdHchTza\n7RQji2PFiq513lpI80FwG7R+3FiJI+dLnagaGmRfsplWrtA2tfRNlVe8AaH9issw\nPepCzISighJdRcZ3g4UxneJWVKnWbrTJvx9vODB08+6FCLVozAYZydNMZ2k1x/2i\nZl8oJcw934k27qHrxkZqdwoVeQKBgQDFk4hu6w7xAxXWh2vp1NOMuKrnbjZWMfKk\n3N2FA11n76dsXP5kHhkxpxkGjFLERrW5X7Kt9ZtUVC5xlHgFQca5vOYaHP9CDTR7\now0FdrfQ6U6NgXqBuaSyu/HXdcd2Jw4/Dt5EVzjvbFFoH4AXzVZLIT/YWW45ENJ5\n+YAzAmU88wKBgG/P8/jhlXY5xCi2WZtkvgjSyrpvCVI9+5y3jobd1zHejoq4sLSA\nmI/HP5GHGZZUYaxF7hrc/TweAo/yK/Ay4uKMJu+CbcMWWL5jBhX8WcY0lIJC95fJ\niWGNP496IPFqGUf0PHygFtTvvl8moJ1cMpK83fXjGgvQYPKaCJDfsrapAoGBAMPz\njG6lhk4WR0RbTvW8dIuuYyHgttdJ9mL4AmN3cN4yW5Qnrs3Q5B/QoAtUhInRr03I\n0ceiPYmna+CN5XMhR1zTMktX0vnJavHsRm/SzH/PxG6nqb6bRfNWX4bXcxmFpqV3\ns42IDBm5Dgv8oef5aMpekZmbKKxEONtsTm9IwuttAoGBAIiC1mBNOqTqIINAfpjn\nyKgfvlHe/D15t6lYqcTiNTQQnp4WJhrBPv0uIZ3wRv0olSUT+B/Q2H2ytoVPTRf4\nP8CRZfLZ5h3CqC31YjiqWzn1kYA6HIzg7ZkV7Ev5w1SbItHUUq+fOGFmbeWoK6/S\nzZFEI7fY0c1IshtlJVUfWfQY\n-----END PRIVATE KEY-----\n`,
  client_email: "feedback-service-account@feedback-app-440415.iam.gserviceaccount.com",
  client_id: "117671887877107186230",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/feedback-service-account%40feedback-app-440415.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Google Sheets API client
const auth = new GoogleAuth({
  credentials: SERVICE_ACCOUNT_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

/**
 * Add feedback to Google Sheet
 * @param {string} spreadsheetId - The ID of the Google Sheet
 * @param {Array} rowData - The row data to append
 */
async function addFeedbackToSheet(spreadsheetId, rowData) {
  const client = await auth.getClient();

  await sheets.spreadsheets.values.append({
    auth: client,
    spreadsheetId,
    range: 'Sheet1!A1', // Replace 'Sheet1' with your specific sheet name
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData]
    }
  });

  console.log('Feedback added successfully to the sheet.');
}

module.exports = { addFeedbackToSheet };
