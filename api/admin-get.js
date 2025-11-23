// api/admin-get.js
const { getSheets } = require('../utils/google');
const { verifyTokenFromReq } = require('../utils/auth');

const SERVICE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

module.exports = async (req, res) => {
  const t = verifyTokenFromReq(req);
  if (!t) return res.status(401).send('Non autorisé');

  if (!SERVICE_KEY || !SHEET_ID) return res.status(500).send('Config Google manquante');

  const id = req.query.id; // _row as used in admin-list
  const sheets = await getSheets(SERVICE_KEY);
  const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Candidatures!A:G' });
  const rows = r.data.values || [];
  if (!id) return res.status(400).send('id manquant');

  const rowIndex = parseInt(id); // approximate: admin-list used rows.length - idx
  // safe approach: we search for matching index from end
  const idx = rows.length - rowIndex;
  if (idx < 0 || idx >= rows.length) return res.status(404).send('Non trouvé');
  const row = rows[idx];
  const obj = {
    Date: row[0] || '',
    Nom: row[1] || '',
    Email: row[2] || '',
    Téléphone: row[3] || '',
    Message: row[4] || '',
    CV_Link: row[5] || '',
    ID_Link: row[6] || ''
  };
  res.json(obj);
};
