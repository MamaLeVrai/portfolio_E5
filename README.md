Portfolio BTS SIO - Thème spatial

Ce petit site statique contient :
- `index.html` : page principale (sections éditables)
- `styles.css` : styles et thème spatial
- `script.js` : fond d'étoiles interactif, sauvegarde locale, aperçu des documents

Comment tester rapidement :
1. Ouvrez `index.html` dans votre navigateur (double-clic). Si certains liens locaux ne fonctionnent pas, lancez un serveur local :

```powershell
# depuis le dossier du projet
python -m http.server 8000
# puis ouvrez http://localhost:8000
```

2. Modifiez le contenu directement dans la page (les éléments avec bordure sont éditables). Cliquez sur "Sauvegarder" pour stocker dans le navigateur.
3. Pour l'examen BTS SIO : ajoutez votre CV, rapport et code dans la section Documents. Fournissez aussi une archive de vos sources si demandé.

Limitations :
- L'upload est client-side seulement : les fichiers ne sont pas envoyés sur un serveur. Les liens aux fichiers sont temporaires pour la session du navigateur.

Améliorations possibles :
- Ajouter export PDF/ZIP des contenus et des fichiers.
- Ajouter hébergement (GitHub Pages) et formulaire de contact sécurisé.

Serveur d'envoi d'e‑mail (optionnel)
 - Un petit serveur Node.js/Express est fourni pour permettre l'envoi d'emails depuis le formulaire.
 - Installer les dépendances et lancer :

```powershell
cd "c:\Users\mmargueray\Documents\portfolio marius\new-portfolio"
npm install
$env:SMTP_HOST = 'smtp.example.com'
$env:SMTP_PORT = '587'
$env:SMTP_USER = 'user@example.com'
$env:SMTP_PASS = 'password'
$env:FROM_ADDRESS = 'user@example.com'
npm start
```

 - Le serveur écoute sur le port 3000 par défaut. Le formulaire POSTe sur `/send` et le serveur utilise `nodemailer`.
 - Remplacez les variables d'environnement par vos informations SMTP. Pour de la production, utilisez un relais SMTP sécurisé et protégez les secrets.
