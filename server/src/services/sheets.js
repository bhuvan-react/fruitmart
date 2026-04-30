const { google } = require('googleapis');

function getAuth() {
  return new google.auth.JWT({
    email: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim(),
    key: process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetId() {
  const id = (process.env.GOOGLE_SHEET_ID || '').trim();
  if (!id) throw new Error('GOOGLE_SHEET_ID env var is not set');
  return id;
}

function getActiveSheetConfig() {
  return {
    sheetId: (process.env.GOOGLE_SHEET_ID || '').trim(),
    serviceAccountEmail: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim(),
  };
}

async function getRows(tabName) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A2:Z`,
  });
  return res.data.values || [];
}

async function appendRow(tabName, values) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

module.exports = { getRows, appendRow, getActiveSheetConfig };
