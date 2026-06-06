"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentQueue = void 0;
const bullmq_1 = require("bullmq");
const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};
exports.assignmentQueue = new bullmq_1.Queue('assignment-generation', {
    connection: redisConnection
});
