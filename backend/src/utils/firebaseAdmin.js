const admin = require('firebase-admin');

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return admin;

  // Prefer explicit service account JSON in env (base64-encoded)
  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (saBase64) {
    try {
      const json = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(json),
      });
      initialized = true;
      return admin;
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e);
    }
  }

  // Fallback to GOOGLE_APPLICATION_CREDENTIALS file path or default credentials
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    initialized = true;
    return admin;
  } catch (e) {
    console.error('Firebase Admin initialization failed. Provide FIREBASE_SERVICE_ACCOUNT_BASE64 or GOOGLE_APPLICATION_CREDENTIALS.', e);
    throw e;
  }
}

module.exports = { initFirebaseAdmin };
