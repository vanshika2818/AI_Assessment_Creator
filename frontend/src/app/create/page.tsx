'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { assessmentSchema } from '@/schemas/assessmentSchema';
import { useAssignmentStore } from '@/store/assignmentStore';
import { motion } from 'framer-motion';
import { FileUp, Calendar, CheckSquare, ListOrdered, GraduationCap, FileText, CheckCircle2, BookOpen, Users, Clock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function AIAssessmentCreator() {
  const store = useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForGeneration, setIsWaitingForGeneration] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('job_completed', (data) => {
      if (currentAssignmentId && data.assignmentId === currentAssignmentId) {
        setIsWaitingForGeneration(false);
        router.push(`/output/${currentAssignmentId}`);
      }
    });

    socket.on('job_failed', (data) => {
      if (currentAssignmentId && data.assignmentId === currentAssignmentId) {
        setIsWaitingForGeneration(false);
        alert('Assignment generation failed. Please try again.');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentAssignmentId, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const payload = {
        title: store.title,
        schoolName: store.schoolName,
        subject: store.subject,
        className: store.className,
        timeAllowed: store.timeAllowed === '' ? undefined : Number(store.timeAllowed),
        numQuestions: store.numQuestions === '' ? undefined : Number(store.numQuestions),
        totalMarks: store.totalMarks === '' ? undefined : Number(store.totalMarks),
        dueDate: store.dueDate,
        questionTypes: store.questionTypes,
        additionalInstructions: store.additionalInstructions,
        file: store.file
      };

      const validatedData = assessmentSchema.parse(payload);

      const response = await fetch('http://localhost:5000/api/assignments/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData),
      });
      const result = await response.json();
      console.log('Assignment generation queued:', result);
      
      if (result.success) {
        setCurrentAssignmentId(result.assignmentId);
        setIsWaitingForGeneration(true);
      }
    } catch (err: any) {
      if (err.errors) {
         const validationErrors: Record<string, string> = {};
         err.errors.forEach((zodError: any) => {
           if (zodError.path[0]) {
             validationErrors[zodError.path[0]] = zodError.message;
           }
         });
         setErrors(validationErrors);
      } else {
        console.error('Failed to submit to backend', err);
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  const typesOptions = [
    'Multiple Choice',
    'Short Answer',
    'Essay',
    'True/False',
    'Coding',
  ];

  if (isWaitingForGeneration) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] rounded-[2rem] shadow-sm text-gray-200 p-4 md:p-8 flex flex-col justify-center items-center font-sans overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-indigo-500/5 blur-[150px] rounded-full mix-blend-screen" />
        </div>
        <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Generating Assessment</h2>
        <p className="text-gray-400">Our AI is drafting your customized question paper...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full py-8 md:py-12 bg-[#0a0a0a] rounded-[2rem] shadow-sm text-gray-200 px-4 md:px-8 flex justify-center items-start font-sans selection:bg-indigo-500/30 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-indigo-500/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="mb-12 text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-2 shadow-xl shadow-black/20"
          >
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
            Assessment Creator
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Configure parameters to generate a tailored, intelligent assessment for your candidates.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2rem] shadow-2xl shadow-black/50">
            
            {/* Assignment Title */}
            <div className="space-y-3 mb-8">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-400" /> Assignment Title
              </label>
              <input
                type="text"
                value={store.title}
                onChange={(e) => store.setField('title', e.target.value)}
                placeholder="e.g. Quiz on Electricity"
                className={cn(
                  "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                  errors.title ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                )}
              />
              {errors.title && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.title}</motion.p>}
            </div>

            {/* Header Metadata Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" /> School Name
                </label>
                <input
                  type="text"
                  value={store.schoolName}
                  onChange={(e) => store.setField('schoolName', e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.schoolName ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                />
                {errors.schoolName && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.schoolName}</motion.p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" /> Subject
                </label>
                <input
                  type="text"
                  value={store.subject}
                  onChange={(e) => store.setField('subject', e.target.value)}
                  placeholder="e.g. Science"
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.subject ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                />
                {errors.subject && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.subject}</motion.p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Class
                </label>
                <input
                  type="text"
                  value={store.className}
                  onChange={(e) => store.setField('className', e.target.value)}
                  placeholder="e.g. 8th"
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.className ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                />
                {errors.className && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.className}</motion.p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" /> Time Allowed (minutes)
                </label>
                <input
                  type="number"
                  value={store.timeAllowed}
                  onChange={(e) => store.setField('timeAllowed', e.target.value)}
                  placeholder="e.g. 45"
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.timeAllowed ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                />
                {errors.timeAllowed && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.timeAllowed}</motion.p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* File Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-indigo-400" /> Source Material <span className="text-gray-500 font-normal text-xs ml-1">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                  <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/15 bg-black/20 rounded-2xl hover:bg-white/5 hover:border-indigo-400/50 transition-all cursor-pointer overflow-hidden">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                      <p className="mb-1 text-sm text-gray-400"><span className="font-semibold text-white">Click to upload</span> or drag</p>
                      <p className="text-xs text-gray-500">PDF, TXT, DOCX</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          store.setField('file', e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
                {store.file && (
                  <motion.p initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-sm text-indigo-300 truncate">
                    Attached: {store.file}
                  </motion.p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" /> Due Date
                </label>
                <input
                  type="date"
                  value={store.dueDate}
                  onChange={(e) => store.setField('dueDate', e.target.value)}
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.dueDate ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                  style={{ colorScheme: 'dark' }}
                />
                {errors.dueDate && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs mt-1">{errors.dueDate}</motion.p>}
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-4 mb-8">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Question Types
              </label>
              <div className="flex flex-wrap gap-3">
                {typesOptions.map(type => {
                  const isSelected = store.questionTypes?.includes(type);
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => store.toggleQuestionType(type)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border",
                        isSelected 
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                          : "bg-black/30 border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200 hover:bg-white/5"
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              {errors.questionTypes && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.questionTypes}</motion.p>}
            </div>

            {/* Numbers Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-orange-400" /> Number of Questions
                </label>
                <input
                  type="number"
                  value={store.numQuestions}
                  onChange={(e) => store.setField('numQuestions', e.target.value)}
                  placeholder="e.g. 10"
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.numQuestions ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                />
                {errors.numQuestions && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.numQuestions}</motion.p>}
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" /> Total Marks
                </label>
                <input
                  type="number"
                  value={store.totalMarks}
                  onChange={(e) => store.setField('totalMarks', e.target.value)}
                  placeholder="e.g. 100"
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all shadow-inner shadow-black/20",
                    errors.totalMarks ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50"
                  )}
                />
                {errors.totalMarks && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red-400 text-xs">{errors.totalMarks}</motion.p>}
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-3 mb-10">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-400" /> Additional Instructions
              </label>
              <textarea
                value={store.additionalInstructions}
                onChange={(e) => store.setField('additionalInstructions', e.target.value)}
                placeholder="Any specific focus areas or difficulty level preferences..."
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all resize-none shadow-inner shadow-black/20"
              ></textarea>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden rounded-2xl font-semibold text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-shimmer transition-all duration-500"></div>
              <div className="relative px-6 py-4 flex items-center justify-center bg-black/20 text-white w-full transition-all group-hover:bg-black/10">
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  'Generate AI Assessment'
                )}
              </div>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
