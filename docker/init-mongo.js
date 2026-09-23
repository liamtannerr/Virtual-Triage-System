const appDb = db.getSiblingDB('virtual_triage');
appDb.createUser({
  user: 'triage_app',
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: 'readWrite', db: 'virtual_triage' }],
});
