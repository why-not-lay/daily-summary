import { start, shutdown } from "./run";

start();

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
