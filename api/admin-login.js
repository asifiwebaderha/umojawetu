// api/admin-login.js
const { signAdmin } = require('../utils/auth');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    let data = {};
    try { data = JSON.parse(body || '{}'); } catch(e){}
    const password = data.password;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    if (!password) return res.status(400).send('Mot de passe requis');
    if (password !== ADMIN_PASSWORD) return res.status(401).send('Mot de passe incorrect');

    const token = signAdmin();
    // set cookie (HttpOnly)
    res.setHeader("Set-Cookie",`uw_admin_token=${token}; HttpOnly; Path=/; Max-Age=${12*3600}; SameSite=None; Secure`);
  } else if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `uw_admin_token=; HttpOnly; Path=/; Max-Age=0`);
    return res.status(200).send('Déconnecté');
  } else {
    return res.status(405).send('Method not allowed');
  }
};
