// api/admin-about.js
const { getSheets } = require('../utils/google');
const { verifyTokenFromReq } = require('../utils/auth');

const SERVICE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

module.exports = async (req, res) => {
  if (!SERVICE_KEY || !SHEET_ID) return res.status(500).send('Config Google manquante');
  const sheets = await getSheets(SERVICE_KEY);

  if (req.method === 'GET') {
    // read cell A1 in sheet "Meta" range About!A1 (or create)
    try {
      const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'About!A1' });
      const txt = (r.data.values && r.data.values[0] && r.data.values[0][0]) || '';
      return res.json({ text: txt });
    } catch(e){
      return res.json({ text: '' });
    }
  } else if (req.method === 'PUT') {
    const tkn = verifyTokenFromReq(req);
    if (!tkn) return res.status(401).send('Non autorisé');

    let body = '';
    for await (const chunk of req) body += chunk;
    let data = {};
    try { data = JSON.parse(body || '{}'); } catch(e) { return res.status(400).send('JSON invalide'); }

    const text = data.text || '';
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'About!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [[text]] }
    });
    return res.status(200).send('Mis à jour');
  } else {
    return res.status(405).send('Method not allowed');
  }
};
