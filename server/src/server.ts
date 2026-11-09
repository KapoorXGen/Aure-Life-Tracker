import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import connectDB from "./config/mongodb.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Aure server running on port ${PORT}`);
    });
};
dns.setServers(["8.8.8.8", "8.8.4.4"]);
startServer();