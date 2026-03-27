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

async function read() {
  // Get sheet metadata to find all tab names
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: '18-k4du4GgRDZR-spAuH6z8HtCk9GByhpzIwWuCMBpDA',
  });
  const tabNames = meta.data.sheets.map(s => s.properties.title);
  console.log('Tabs:', tabNames);

  for (const tab of tabNames) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '18-k4du4GgRDZR-spAuH6z8HtCk9GByhpzIwWuCMBpDA',
      range: `${tab}!A1:Z20`,
    });
    console.log(`\n=== ${tab} ===`);
    (res.data.values || []).forEach(row => console.log(row));
  }
}

read().catch(err => console.error(err.message));
