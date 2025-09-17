// Script: définir ou retirer le rôle administrateur (custom claim) sur un utilisateur Firebase Auth
// Usage:
//  node scripts/admin/setAdminClaim.js --email user@example.com --enable
//  node scripts/admin/setAdminClaim.js --email user@example.com --disable

const { admin } = require('../import/firebaseConfig');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { email: null, enable: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--email') {
      out.email = args[i + 1];
      i++;
    } else if (a === '--enable') {
      out.enable = true;
    } else if (a === '--disable') {
      out.enable = false;
    }
  }
  return out;
}

async function main() {
  const { email, enable } = parseArgs();
  if (!email || enable === null) {
    console.error('Usage: node scripts/admin/setAdminClaim.js --email user@example.com --enable|--disable');
    process.exit(1);
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    const current = user.customClaims || {};
    const nextClaims = { ...current, admin: !!enable };
    if (enable === false) {
      // Optionnel: retirer la clé admin complètement
      delete nextClaims.admin;
    }

    await admin.auth().setCustomUserClaims(user.uid, nextClaims);
    console.log(`OK: rôle admin ${enable ? 'activé' : 'désactivé'} pour ${email} (uid=${user.uid}).`);
    console.log('Important: l’utilisateur doit se déconnecter/reconnecter pour rafraîchir son token.');
  } catch (e) {
    console.error('Erreur:', e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
