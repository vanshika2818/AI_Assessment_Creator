import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Assignment from './models/Assignment';
import { assignmentQueue } from './jobs/queue';
import { initWorker } from './jobs/worker';

import { Server } from 'socket.io';
import http from 'http';

const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-assessment';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Initialize BullMQ Worker with io
initWorker(io);

io.on('connection', (socket) => {
  console.log('Client connected to websocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req: Request, res: Response) => {
  res.send('AI Assessment Creator API is running');
});

// We keep the old endpoint if needed, but here's the new requested one
app.post('/api/assignments/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title,
      dueDate, 
      questionTypes, 
      totalQuestions, 
      totalMarks, 
      additionalInstructions,
      numQuestions,
      schoolName,
      subject,
      className,
      timeAllowed
    } = req.body;

    // Map question types if it's coming from the frontend as strings
    let mappedQuestionTypes = [];
    if (Array.isArray(questionTypes)) {
      mappedQuestionTypes = questionTypes.map((qt: any) => {
        if (typeof qt === 'string') {
          return { type: qt }; // Missing numberOfQuestions and marks temporarily
        }
        return qt;
      });
    }

    const newAssignment = new Assignment({
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

    await assignmentQueue.add('generate', {
      assignmentId: savedAssignment._id,
      payload: req.body
    });

    res.status(201).json({ 
      success: true, 
      assignmentId: savedAssignment._id,
      message: "Job added to queue"
    });
  } catch (error) {
    console.error('Error generating assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to generate assignment' });
  }
});

app.get('/api/assignments', async (req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

app.get('/api/assignments/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
});

app.delete('/api/assignments/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete assignment' });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
