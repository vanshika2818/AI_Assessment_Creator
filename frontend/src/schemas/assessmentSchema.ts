import { z } from 'zod';

export const assessmentSchema = z.object({
  title: z.string().min(1, 'Assignment Title is required'),
  file: z.any().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(z.string()).min(1, 'Select at least one question type'),
  schoolName: z.string().min(1, 'School name is required'),
  subject: z.string().min(1, 'Subject is required'),
  className: z.string().min(1, 'Class is required'),
  timeAllowed: z.number({
    message: 'Time allowed is required and must be a number',
  }).positive('Time allowed must be greater than 0'),
  numQuestions: z.number({
    message: 'Number of questions is required and must be a number',
  }).positive('Number of questions must be greater than 0'),
  totalMarks: z.number({
    message: 'Total marks is required and must be a number',
  }).positive('Total marks must be greater than 0'),
  additionalInstructions: z.string().optional(),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;
