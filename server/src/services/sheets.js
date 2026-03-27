require('dotenv').config();
const { google } = require('googleapis');

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

/**
 * Read all rows from a named tab, skipping the header row (row 1).
 * @param {string} tabName - The sheet tab name (e.g. 'Users', 'Fruits', 'Orders')
 * @returns {Promise<string[][]>} Array of row arrays
 */
async function getRows(tabName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A2:Z`,
  });
  return res.data.values || [];
}

/**
 * Append a single row of values to a named tab.
 * @param {string} tabName - The sheet tab name
 * @param {Array} values - The values to write as a row
 */
async function appendRow(tabName, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

module.exports = { getRows, appendRow };
