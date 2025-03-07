import db from "./db.js";

// Create Database Table 
await db.execute(`
    CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL
    );
`);
console.log("Table Created");


const [rows] = await db.execute("SELECT COUNT(*) AS count FROM locations");
if (rows[0].count === 0) {
    console.log("Seeding Database...");

    //  Inserting  Data
    const sql = `
        INSERT INTO locations (name, address, latitude, longitude) 
        VALUES (?, ?, ?, ?)
    `;
    const schoolData = [
        ["Dhirubhai Ambani International School", "BKC, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra", 19.0662, 72.8648],
        ["Bombay Scottish School", "Powai, Mumbai, Maharashtra", 19.1197, 72.9054],
        ["Jamnabai Narsee School", "Juhu, Mumbai, Maharashtra", 19.1077, 72.8293],
        ["Cathedral and John Connon School", "Fort, Mumbai, Maharashtra", 18.9322, 72.8306],
        ["Podar International School", "Santacruz West, Mumbai, Maharashtra", 19.0820, 72.8376],
        ["Lilavatibai Podar High School", "Santacruz West, Mumbai, Maharashtra", 19.0820, 72.8376],
        ["Ryan International School", "Malad West, Mumbai, Maharashtra", 19.1869, 72.8486],
        ["Arya Vidya Mandir", "Bandra West, Mumbai, Maharashtra", 19.0596, 72.8295],
        ["Gokuldham High School", "Goregaon East, Mumbai, Maharashtra", 19.1642, 72.8550],
        ["St. Xavier's High School", "Fort, Mumbai, Maharashtra", 18.9322, 72.8306]
    ];

    
    for (const data of schoolData) {
        await db.query(sql, data);
    }

    console.log(" Data Inserted Successfully");
} else {
    console.log("Database already has data");
}


const [allRows] = await db.execute("SELECT * FROM locations");
console.log(allRows);

await db.end();

