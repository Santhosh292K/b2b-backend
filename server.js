const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start server
        const server = app.listen(config.port, () => {
            console.log(`
🚀 Server running in ${config.nodeEnv} mode
📍 Port: ${config.port}
🔗 Health: http://localhost:${config.port}/health
📚 API Base: http://localhost:${config.port}/api
      `);
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(() => {
                console.log('HTTP server closed.');
                process.exit(0);
            });

            // Force close after 10s
            setTimeout(() => {
                console.error('Forcing shutdown...');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
