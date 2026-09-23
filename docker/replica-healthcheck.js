// Initializes an existing or fresh local database without deleting its data.
// Credentials stay inside the container environment, not command arguments.
try {
  const admin = db.getSiblingDB('admin');
  if (!admin.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)) {
    quit(1);
  }
  try {
    rs.status();
  } catch (error) {
    if (error.code !== 94) throw error; // NotYetInitialized
    rs.initiate({ _id: 'triage-rs', members: [{ _id: 0, host: 'localhost:27017' }] });
  }
  quit(admin.runCommand({ hello: 1 }).isWritablePrimary ? 0 : 1);
} catch (error) {
  quit(1);
}
