/**
 * MongoDB Replica Set Initialization Script
 *
 * This script runs on MongoDB container startup to ensure the replica set
 * is properly initialized. It's idempotent - safe to run multiple times.
 *
 * Usage: Mounted as a startup script in docker-compose.yml
 */

// Check if replica set is already initialized
try {
  const status = rs.status();
  if (status.ok === 1) {
    print("Replica set 'rs0' is already initialized and healthy");
    print("  State: " + status.myState + " (" + (status.myState === 1 ? "PRIMARY" : "OTHER") + ")");
    print("  Members: " + status.members.length);
  }
} catch (e) {
  // rs.status() throws if replica set isn't initialized
  if (e.codeName === "NotYetInitialized" || e.message.includes("no replset config")) {
    print("Initializing replica set 'rs0'...");

    const config = {
      _id: "rs0",
      members: [
        { _id: 0, host: "localhost:27017" }
      ]
    };

    const result = rs.initiate(config);

    if (result.ok === 1) {
      print("Replica set 'rs0' initialized successfully!");
      print("Waiting for PRIMARY election...");

      // Wait for the node to become primary (up to 30 seconds)
      let attempts = 0;
      while (attempts < 30) {
        sleep(1000);
        attempts++;
        try {
          const newStatus = rs.status();
          if (newStatus.myState === 1) {
            print("Node elected as PRIMARY after " + attempts + " seconds");
            break;
          }
        } catch (statusErr) {
          // Ignore errors during initialization
        }
      }
    } else {
      print("Failed to initialize replica set:");
      printjson(result);
    }
  } else {
    print("Unexpected error checking replica set status:");
    print(e.message);
  }
}
