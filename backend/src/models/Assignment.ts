import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType {
  type: string;
  numberOfQuestions?: number;
  marks?: number;
}

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: number;
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema({
  type: { type: String, required: true },
  numberOfQuestions: { type: Number },
  marks: { type: Number }
}, { _id: false });

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionTypes: { type: [QuestionTypeSchema], required: true },
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  timeAllowed: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
    required: true
  },
  result: { type: Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
