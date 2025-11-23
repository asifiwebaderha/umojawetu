# README SETUP - Umoja Wetu (setup rapide)

1) Crée un projet Google Cloud
- https://console.cloud.google.com/
- Active **Google Sheets API** et **Google Drive API**.

2) Service Account
- IAM & Admin → Service Accounts → Create Service Account.
- Crée une clé JSON → télécharge le fichier.
- Copie le contenu JSON (tu le placeras dans Vercel env `GOOGLE_SERVICE_ACCOUNT_KEY`).

3) Google Sheet
- Crée une nouvelle Sheet. Renomme un onglet en `Candidatures`.
- (Optionnel) crée des onglets `About` et `Offer`.
- Partage la Sheet avec l'email du Service Account (éditeur).
- Récupère le `SHEET_ID` depuis l'URL et mets-le dans `GOOGLE_SHEET_ID`.

#Important : Structure recommandée
Dans `Candidatures` ajoute en première ligne (facultatif) :
`Date | Nom | Email | Téléphone | Message | CV_Link | ID_Link`

4) Google Drive
- Crée un dossier (ex: `umojawetu-candidatures`).
- Partage ce dossier avec l'email du Service Account en édition.
- Récupère l'ID du dossier (depuis URL) → `GOOGLE_DRIVE_FOLDER_ID`.

5) reCAPTCHA (optionnel mais recommandé)
- https://www.google.com/recaptcha/admin/create
- Choisis reCAPTCHA v2 (Invisible) ou v3. Obtiens SITE_KEY et SECRET.
- Ajoute `RECAPTCHA_SITE_KEY` et `RECAPTCHA_SECRET` dans Vercel.

6) SMTP (Gmail gratuit)
- Si tu utilises Gmail : active 2FA et crée un mot de passe d'application.
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_PORT` = 587
- `SMTP_USER` = ton.email@gmail.com
- `SMTP_PASS` = mot de passe d'application
- `NOTIFY_EMAIL` = adresse admin pour notifications

7) Variables d'environnement (Vercel)
Dans le projet Vercel (Settings → Environment Variables) ajoute :
- `GOOGLE_SERVICE_ACCOUNT_KEY` (copie le JSON complet en une ligne)
- `GOOGLE_SHEET_ID`
- `GOOGLE_DRIVE_FOLDER_ID`
- `RECAPTCHA_SECRET` (optionnel)
- `RECAPTCHA_SITE_KEY` (optionnel, client)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (optionnel)
- `NOTIFY_EMAIL` (optionnel)
- `ADMIN_PASSWORD` (ex: `ChangeMe123!`)
- `JWT_SECRET` (une chaine aléatoire)
- `APP_ORIGIN` (ton url Vercel, ex: https://mon-site.vercel.app)

8) Déploiement
- Installe Vercel CLI si tu veux : `npm i -g vercel`
- Dans le dossier du projet :
  ```bash
  npm install
  vercel
  # ou en prod
  vercel --prod
