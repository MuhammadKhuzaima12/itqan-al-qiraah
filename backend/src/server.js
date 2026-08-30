import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import recitationRoutes from "./routes/recitationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/recitation", recitationRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Itqan Al-Qira'ah backend is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Itqan backend running on port ${PORT}`);
});