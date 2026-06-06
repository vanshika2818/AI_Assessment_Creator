"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Assignment_1 = __importDefault(require("./models/Assignment"));
const queue_1 = require("./jobs/queue");
const worker_1 = require("./jobs/worker");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-assessment';
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // For development, allow all
        methods: ['GET', 'POST']
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize BullMQ Worker with io
(0, worker_1.initWorker)(io);
io.on('connection', (socket) => {
    console.log('Client connected to websocket:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
// Connect to MongoDB
mongoose_1.default.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.get('/', (req, res) => {
    res.send('AI Assessment Creator API is running');
});
// We keep the old endpoint if needed, but here's the new requested one
app.post('/api/assignments/generate', async (req, res) => {
    try {
        const { title, dueDate, questionTypes, totalQuestions, totalMarks, additionalInstructions, numQuestions, schoolName, subject, className, timeAllowed } = req.body;
        // Map question types if it's coming from the frontend as strings
        let mappedQuestionTypes = [];
        if (Array.isArray(questionTypes)) {
            mappedQuestionTypes = questionTypes.map((qt) => {
                if (typeof qt === 'string') {
                    return { type: qt }; // Missing numberOfQuestions and marks temporarily
                }
                return qt;
            });
        }
        const newAssignment = new Assignment_1.default({
            title: title || 'Untitled Assignment',
            dueDate: dueDate || new Date(),
            questionTypes: mappedQuestionTypes,
            schoolName: schoolName || 'Delhi Public School',
            subject: subject || 'Science',
            className: className || '8th',
            timeAllowed: timeAllowed || 45,
            totalQuestions: totalQuestions || numQuestions || 0,
            totalMarks: totalMarks || 0,
            additionalInstructions: additionalInstructions || '',
            status: 'PENDING'
        });
        const savedAssignment = await newAssignment.save();
        await queue_1.assignmentQueue.add('generate', {
            assignmentId: savedAssignment._id,
            payload: req.body
        });
        res.status(201).json({
            success: true,
            assignmentId: savedAssignment._id,
            message: "Job added to queue"
        });
    }
    catch (error) {
        console.error('Error generating assignment:', error);
        res.status(500).json({ success: false, error: 'Failed to generate assignment' });
    }
});
app.get('/api/assignments', async (req, res) => {
    try {
        const assignments = await Assignment_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: assignments });
    }
    catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
    }
});
app.get('/api/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.default.findById(id);
        if (!assignment) {
            res.status(404).json({ success: false, error: 'Assignment not found' });
            return;
        }
        res.status(200).json({ success: true, data: assignment });
    }
    catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
    }
});
app.delete('/api/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Assignment_1.default.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Assignment deleted' });
    }
    catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ success: false, error: 'Failed to delete assignment' });
    }
});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
