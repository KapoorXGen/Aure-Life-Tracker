import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Aure API server is running!",
    });
});

export default app;