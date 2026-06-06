import { create } from 'zustand';

interface AssignmentStoreState {
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: number | '';
  numQuestions: number | '';
  totalMarks: number | '';
  dueDate: string;
  questionTypes: string[];
  additionalInstructions: string;
  file: any;
  setField: (field: string, value: any) => void;
  toggleQuestionType: (type: string) => void;
  resetForm: () => void;
}

export const useAssignmentStore = create<AssignmentStoreState>((set) => ({
  title: '',
  schoolName: '',
  subject: '',
  className: '',
  timeAllowed: '',
  numQuestions: '',
  totalMarks: '',
  dueDate: '',
  questionTypes: [],
  additionalInstructions: '',
  file: null,
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  toggleQuestionType: (type) => set((state) => ({
    questionTypes: state.questionTypes.includes(type)
      ? state.questionTypes.filter(t => t !== type)
      : [...state.questionTypes, type]
  })),
  resetForm: () => set({
    title: '',
    schoolName: '',
    subject: '',
    className: '',
    timeAllowed: '',
    numQuestions: '',
    totalMarks: '',
    dueDate: '',
    questionTypes: [],
    additionalInstructions: '',
    file: null,
  })
}));
