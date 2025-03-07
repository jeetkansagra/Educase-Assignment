import express from "express";
import db from "./db.js";
import { z } from "zod"; 

const app = express();
app.use(express.json());

const schoolSchema = z.object({
    name: z.string().min(3),
    address: z.string().min(5),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

//  Add School
app.post("/addSchool", async (req, res) => {
    try {
        const result = schoolSchema.safeParse(req.body);
        
        if (!result.success) {
            return res.status(400).json({ message:"Invalid Inputs" });
        }

        const { name, address, latitude, longitude } = result.data;

        const [existingSchools] = await db.execute(
            "SELECT * FROM locations WHERE name = ? AND address = ?",
            [name, address]
        );

        if (existingSchools.length > 0) {
            return res.status(409).json({ message: "School already exists!" });
        }

        await db.query(`INSERT INTO locations (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`, 
            [name, address, latitude, longitude]);

        res.status(201).json({ message: "School added successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


function getDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}


const locationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

//  List School
app.get("/listSchools",async(req,res) => {

    try {
        const parseData = {
            latitude : Number(req.query.latitude),
            longitude: Number(req.query.longitude)
        };

        const result = locationSchema.safeParse(parseData)

        if(!result.success){
            return res.status(400).json({message:"Invalid Inputs"})
        }

        const {latitude,longitude} = result.data

        const[schools] = await db.execute("SELECT * FROM locations");
        if(schools.length === 0){
            return res.status(404).json({message:"No schools found"})
        }


        const sortedSchools = schools.map (school => ({
            ...school,
            distance : getDistance(latitude,longitude,school.latitude,school.longitude)
        })).sort((a,b) => a.distance - b.distance)

        res.status(200).json({schools : sortedSchools})

    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
