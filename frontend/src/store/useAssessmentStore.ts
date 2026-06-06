import { create } from 'zustand';
import { AssessmentFormData } from '@/schemas/assessmentSchema';

interface AssessmentState {
  formData: AssessmentFormData | null;
  setFormData: (data: AssessmentFormData) => void;
  resetForm: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  formData: null,
  setFormData: (data) => set({ formData: data }),
  resetForm: () => set({ formData: null }),
}));
