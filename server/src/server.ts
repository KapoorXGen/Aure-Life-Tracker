import "dotenv/config";
import dns from "node:dns";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);

        const [{ default: app }, { default: connectDB }] = await Promise.all([
            import("./app.js"),
            import("./config/mongodb.js"),
        ]);

        await connectDB();

        app.listen(PORT, () => {
            console.log(`Aure server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
    }
};

startServer();