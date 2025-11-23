// utils/google.js
const { google } = require('googleapis');

function initClientFromKey(jsonKey) {
  const key = typeof jsonKey === 'string' ? JSON.parse(jsonKey) : jsonKey;
  const auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
  );
  return auth;
}

async function getSheets(jsonKey) {
  const auth = initClientFromKey(jsonKey);
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

async function getDrive(jsonKey) {
  const auth = initClientFromKey(jsonKey);
  await auth.authorize();
  return google.drive({ version: 'v3', auth });
}

module.exports = { getSheets, getDrive, initClientFromKey };
