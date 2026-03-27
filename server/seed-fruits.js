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

// Columns: Name | Price | ImageURL | Stock | Category | Unit
// Unit: 'kg' = price per kg (sold in 250g steps)
//       '250gm' = price per 250gm pack
//       'pcs' = price per piece
//       'pack3' = price per bundle of 3 pieces
const fruits = [
  // ── Exotic Fruits ──
  ['Avocado',                       110, '', 45,  'Exotic Fruits',      'pcs'],
  ['Blueberry',                     369, '', 30,  'Exotic Fruits',      'pcs'],
  ['Red Globe Grapes',              280, '', 40,  'Exotic Fruits',      'kg'],
  ['Green Globe Grapes',            260, '', 35,  'Exotic Fruits',      'kg'],
  ['Fuji Apple',                    349, '', 50,  'Exotic Fruits',      'pcs'],
  ['Pink Lady Apple',               349, '', 40,  'Exotic Fruits',      'pcs'],
  ['Royal Gala Apple',              299, '', 55,  'Exotic Fruits',      'pcs'],
  ['Pomegranate Premium',           349, '', 30,  'Exotic Fruits',      'pcs'],
  ['Mandarin',                      369, '', 25,  'Exotic Fruits',      'pcs'],
  ['Pomegranate Economy',           289, '', 40,  'Exotic Fruits',      'pcs'],
  ['Imported Longan/Litchi',        450, '', 20,  'Exotic Fruits',      'pcs'],
  ['Red Pears',                     320, '', 35,  'Exotic Fruits',      'pcs'],
  ['Green Pears',                   300, '', 40,  'Exotic Fruits',      'pcs'],
  ['Green Apple',                   329, '', 45,  'Exotic Fruits',      'pcs'],
  ['Imported White Flesh Dragon',   580, '', 15,  'Exotic Fruits',      'pcs'],
  ['Red Flesh Dragon',              550, '', 15,  'Exotic Fruits',      'pcs'],
  ['Kiwi Green',                    100, '', 60,  'Exotic Fruits',      'pack3'],
  ['Golden Kiwi',                   250, '', 30,  'Exotic Fruits',      'pack3'],

  // ── Exotic Vegetables ──
  ['Brocolli',                       80, '', 50,  'Exotic Vegetables',  'pcs'],
  ['Iceberg Lettuce',                90, '', 40,  'Exotic Vegetables',  'pcs'],
  ['Redbell Pepper',                 70, '', 60,  'Exotic Vegetables',  'pcs'],
  ['Yellowbell Pepper',              70, '', 55,  'Exotic Vegetables',  'pcs'],
  ['Green Lettuce',                  65, '', 45,  'Exotic Vegetables',  'pcs'],
  ['Spring Onions',                  30, '', 80,  'Exotic Vegetables',  'pcs'],
  ['Cherry Tomato',                 120, '', 50,  'Exotic Vegetables',  'pcs'],
  ['Parsley Leaves',                 50, '', 40,  'Exotic Vegetables',  'pcs'],
  ['Basil Leaves',                   50, '', 35,  'Exotic Vegetables',  'pcs'],
  ['Baby Corn',                      60, '', 45,  'Exotic Vegetables',  'pcs'],
  ['Mushroom',                       80, '', 40,  'Exotic Vegetables',  'pcs'],

  // ── Dry Fruits ──
  ['Cashew',                        220, '', 55,  'Dry Fruits',         '250gm'],
  ['Kismiss',                        80, '', 70,  'Dry Fruits',         '250gm'],
  ['Badam',                         200, '', 60,  'Dry Fruits',         '250gm'],
  ['Pista',                         350, '', 40,  'Dry Fruits',         '250gm'],
  ['Kimia Dates',                   180, '', 50,  'Dry Fruits',         '250gm'],
  ['Anjeer',                        250, '', 35,  'Dry Fruits',         '250gm'],
  ['Walnuts',                       220, '', 45,  'Dry Fruits',         '250gm'],
  ['Black Raisins',                  90, '', 65,  'Dry Fruits',         '250gm'],
  ['Sunflower Seeds',                60, '', 80,  'Dry Fruits',         '250gm'],
  ['Pumpkin Seeds',                  80, '', 70,  'Dry Fruits',         '250gm'],
  ['Sabja Seeds',                    40, '', 90,  'Dry Fruits',         '250gm'],
  ['Chia Seeds',                    100, '', 60,  'Dry Fruits',         '250gm'],
  ['Dates',                         150, '', 55,  'Dry Fruits',         '250gm'],

  // ── Local Fruits ──
  ['Banana',                         55, '', 200, 'Local Fruits',       'kg'],
  ['Watermelon',                     35, '', 80,  'Local Fruits',       'kg'],
  ['Muskmelon',                      40, '', 60,  'Local Fruits',       'kg'],
  ['Pineapple',                      80, '', 50,  'Local Fruits',       'kg'],
  ['Delhi Orange',                   60, '', 120, 'Local Fruits',       'kg'],
  ['Nagpur Orange',                  70, '', 100, 'Local Fruits',       'kg'],
  ['Black Grapes',                   80, '', 90,  'Local Fruits',       'kg'],
  ['Green Grapes',                   75, '', 85,  'Local Fruits',       'kg'],
  ['Mango Banganapalli',            120, '', 70,  'Local Fruits',       'kg'],
  ['Mango/Rasalu',                  130, '', 60,  'Local Fruits',       'kg'],
  ['Papaya',                         40, '', 75,  'Local Fruits',       'kg'],

  // ── Cut Fruit & Juices ──
  ['Exotic Fruit Salad',            200, '', 30,  'Cut Fruit & Juices', 'pcs'],
  ['Local Fruit Salad',             150, '', 35,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Pomegranate Juice',180, '', 25,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Pineapple Juice',  160, '', 25,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Litchi Juice',     180, '', 20,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Mango Juice',      170, '', 30,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Watermelon Juice', 150, '', 30,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Muskmelon Juice',  150, '', 25,  'Cut Fruit & Juices', 'pcs'],
  ['Cold-Pressed Papaya Juice',     150, '', 20,  'Cut Fruit & Juices', 'pcs'],
];

async function seed() {
  // Update Fruits header
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Fruits!A1:F1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Name', 'Price', 'ImageURL', 'Stock', 'Category', 'Unit']] },
  });

  // Clear existing data and write all rows
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: 'Fruits!A2:F1000',
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Fruits!A2:F${fruits.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: fruits },
  });

  // Update Orders header for new per-item structure
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Orders!A1:P1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'Bill No', 'Date', 'Time', 'Customer Name', 'Phone',
        'Category', 'Item', 'Qty', 'Unit Price (₹)', 'Item Total (₹)',
        'Bill Subtotal (₹)', 'GST %', 'GST Amount (₹)', 'Grand Total (₹)',
        'Cash Received (₹)', 'Change (₹)'
      ]]
    },
  });

  console.log(`✅ Seeded ${fruits.length} products across 5 categories`);
  console.log('✅ Updated Orders sheet header');
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
