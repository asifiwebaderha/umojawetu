// api/submit.js
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { getSheets, getDrive } = require('../utils/google');
const { sendMail } = require('../utils/mail');

const SERVICE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET) return true;
  if (!token) return false;
  const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: `secret=${RECAPTCHA_SECRET}&response=${token}`
  });
  const j = await resp.json();
  return j.success === true;
}

async function uploadFileToDrive(drive, file, folderId) {
  const stream = fs.createReadStream(file.path);
  const meta = {
    name: file.originalFilename || path.basename(file.path),
    parents: folderId ? [folderId] : []
  };
  const r = await drive.files.create({
    requestBody: meta,
    media: { mimeType: file.headers['content-type'], body: stream },
    fields: 'id, webViewLink'
  });
  // file created
  return r.data;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) { console.error(err); return res.status(400).send('Invalid form'); }
    try {
      const nom = (fields.nom || [''])[0];
      const email = (fields.email || [''])[0];
      const telephone = (fields.telephone || [''])[0];
      const message = (fields.message || [''])[0];
      const recaptchaToken = (fields.recaptchaToken || [''])[0];

      if (!nom || !email || !telephone) return res.status(400).send('Champs manquants');

      if (!/^\+243\d{9}$/.test(telephone)) return res.status(400).send('Téléphone invalide (doit être +243XXXXXXXXX)');

      const okRecap = await verifyRecaptcha(recaptchaToken);
      if (!okRecap) return res.status(400).send('reCAPTCHA invalide');

      const cv = files.cv && files.cv[0];
      const idphoto = files.idphoto && files.idphoto[0];
      if (!cv || !idphoto) return res.status(400).send('Fichiers requis manquants');

      // Google API
      if (!SERVICE_KEY || !SHEET_ID) {
        return res.status(500).send('Configuration Google manquante');
      }
      const drive = await getDrive(SERVICE_KEY);
      const sheets = await getSheets(SERVICE_KEY);

      // Upload CV and ID photo to Drive
      const cvMeta = await uploadFileToDrive(drive, cv, DRIVE_FOLDER_ID);
      const idMeta = await uploadFileToDrive(drive, idphoto, DRIVE_FOLDER_ID);

      // Append to Google Sheet (onglet "Candidatures")
      const now = new Date().toISOString();
      const cvLink = `https://drive.google.com/file/d/${cvMeta.id}/view`;
      const idLink = `https://drive.google.com/file/d/${idMeta.id}/view`;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Candidatures!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[now, nom, email, telephone, message || '', cvLink, idLink]]
        }
      });

      // Send confirmation email to candidate and notification to admin (if SMTP configured)
      if (process.env.SMTP_HOST) {
        // candidate confirmation
        await sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Candidature reçue — Umoja Wetu',
          text: `Bonjour ${nom},\n\nNous avons bien reçu votre candidature pour le poste Program Coordinator. Merci de votre intérêt.\n\nCordialement,\nUmoja Wetu`
        });
        // admin notification
        if (process.env.NOTIFY_EMAIL) {
          await sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.NOTIFY_EMAIL,
            subject: 'Nouvelle candidature — Umoja Wetu',
            html: `<p>Nouvelle candidature de <b>${nom}</b> (${email}, ${telephone}).<br/>
                   CV: <a href="${cvLink}">CV</a><br/>ID: <a href="${idLink}">Carte électeur</a></p>`
          });
        }
      }

      // clean temporary files
      try { [cv.path, idphoto.path].forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); }); } catch(e){}

      return res.status(200).send('Candidature reçue');
    } catch (e) {
      console.error(e);
      return res.status(500).send('Erreur serveur');
    }
  });
};
