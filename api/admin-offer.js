// api/admin-offer.js
const jwt = require('jsonwebtoken');
const { getSheets } = require('../utils/google');

const SERVICE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Vérifier authentification admin via cookie JWT ---
function isAuthenticated(req) {
  try {
    const cookie = req.headers.cookie || "";
    const token = cookie.split("token=")[1];
    if (!token) return false;
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).send('Non autorisé');
  }

  // Instancier Google Sheets
  let sheets;
  try {
    sheets = await getSheets(SERVICE_KEY);
  } catch (err) {
    console.error("Erreur Sheets:", err);
    return res.status(500).send("Erreur Google Sheets");
  }

  // -----------------------
  // GET → Lire l’offre actuelle
  // -----------------------
  if (req.method === 'GET') {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Config!A2',
      });

      const offerText = (response.data.values && response.data.values[0]) 
        ? response.data.values[0][0] 
        : "";

      return res.status(200).json({ offer: offerText });
    } catch (err) {
      console.error("Erreur lecture offer:", err);
      return res.status(500).send("Erreur lecture de l’offre");
    }
  }

  // -----------------------
  // POST → Modifier l’offre
  // -----------------------
  if (req.method === 'POST') {
    try {
      const body = await new Promise((resolve) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => resolve(JSON.parse(data || "{}")));
      });

      const newOffer = body.offer || "";
      if (!newOffer.trim()) {
        return res.status(400).send("L’offre ne peut pas être vide");
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Config!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newOffer]]
        }
      });

      return res.status(200).json({ success: true, message: "Offre mise à jour" });
    } catch (err) {
      console.error("Erreur maj offer:", err);
      return res.status(500).send("Erreur mise à jour de l’offre");
    }
  }

  // Méthodes non acceptées
  return res.status(405).send("Méthode non autorisée");
};
