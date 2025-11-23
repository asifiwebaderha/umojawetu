// api/admin-list.js
const { getSheets } = require('../utils/google');
const { verifyTokenFromReq } = require('../utils/auth');

const SERVICE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

module.exports = async (req, res) => {
  const t = verifyTokenFromReq(req);
  if (!t) return res.status(401).send('Non autorisé');

  if (!SERVICE_KEY || !SHEET_ID) return res.status(500).send('Config Google manquante');

  const sheets = await getSheets(SERVICE_KEY);
  // read range (Candidatures sheet)
  const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Candidatures!A:G' });
  const rows = r.data.values || [];
  // rows: [ [Date, Nom, Email, Téléphone, Message, CV_Link, ID_Link], ... ]
  // transform: latest first, add _row index for retrieval
  const list = rows.slice().reverse().map((row, idx) => {
    return {
      _row: rows.length - idx, // 1-based index approximate
      Date: row[0] || '',
      Nom: row[1] || '',
      Email: row[2] || '',
      Téléphone: row[3] || '',
      Message: row[4] || '',
      CV_Link: row[5] || '',
      ID_Link: row[6] || ''
    };
  });
  res.json(list);
};
