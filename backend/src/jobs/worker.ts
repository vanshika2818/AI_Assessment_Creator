import { Worker, Job } from 'bullmq';
import Assignment from '../models/Assignment';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const initWorker = (io: Server) => {
  const worker = new Worker('assignment-generation', async (job: Job) => {
    const { assignmentId, payload } = job.data;
    console.log(`Processing job ${job.id} for assignment ${assignmentId}`);
    
    try {
      const { questionTypes, totalMarks, numQuestions, additionalInstructions, schoolName, subject, className, timeAllowed } = payload;

      let mappedTypesStr = "Standard Questions";
      if (Array.isArray(questionTypes) && questionTypes.length > 0) {
        mappedTypesStr = questionTypes.map((qt: any) => typeof qt === 'string' ? qt : qt.type).join(', ');
      }
      
      const prompt = `You are an expert teacher. Generate a question paper.
The user requested the following exact sections based on these question types: [${mappedTypesStr}].
Total Marks must be exactly ${totalMarks || 20}.
Total Questions should be around ${numQuestions || 10}.
Follow these extra instructions: ${additionalInstructions || 'Make it standard difficulty.'}.

Return a strictly valid JSON object representing the generated question paper. Do not include markdown formatting like \`\`\`json or \`\`\`. Return ONLY raw parseable JSON.
The JSON must strictly match this exact schema:
{
  "school": "${schoolName || 'Delhi Public School'}",
  "subject": "${subject || 'Science'}",
  "class": "${className || '8th'}",
  "timeAllowed": "${timeAllowed || 45} minutes",
  "maxMarks": ${totalMarks || 20},
  "sections": [
    {
      "title": "Section A",
      "type": "string (e.g. 'Multiple Choice' or 'Short Answer')",
      "instructions": "string",
      "questions": [
        {
          "id": 1,
          "difficulty": "Easy/Moderate/Challenging",
          "text": "Question text",
          "marks": 2,
          "answer": "Answer text"
        }
      ]
    }
  ]
}`;

      let generatedResult;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean up response text in case the LLM returns markdown blocks anyway
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        generatedResult = JSON.parse(cleanedText);
      } catch (llmError) {
        console.error("LLM Generation failed, using fallback:", llmError);
        generatedResult = {
          school: schoolName || "Default School",
          subject: subject || "Science",
          class: className || "8th",
          timeAllowed: `${timeAllowed || 45} minutes`,
          maxMarks: totalMarks || 20,
          sections: [
            {
              title: "Fallback Section",
              type: "Standard",
              instructions: "Attempt all questions.",
              questions: [
                {
                  id: 1,
                  difficulty: "Moderate",
                  text: "Fallback Question: The AI generation failed. Please try again or check your API key.",
                  marks: totalMarks || 20,
                  answer: "N/A"
                }
              ]
            }
          ]
        };
      }

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'COMPLETED',
        result: generatedResult
      });
      
      console.log(`Job ${job.id} completed. Assignment ${assignmentId} is now COMPLETED.`);
      
      io.emit('job_completed', { assignmentId });
      
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to process job ${job.id}:`, error);
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'FAILED' });
      
      io.emit('job_failed', { assignmentId, error: error.message || 'Unknown error' });
      throw error;
    }
  }, {
    connection: redisConnection
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
  });

  console.log('Assignment generation worker initialized');
  return worker;
};
