'use client';

import { useRef, useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

interface Question {
  id: number;
  difficulty: string;
  text: string;
  marks: number;
  answer: string;
}

interface Section {
  title: string;
  type: string;
  instructions: string;
  questions: Question[];
}

interface PaperData {
  school: string;
  subject: string;
  class: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
}

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  if (!difficulty) return null;
  const d = difficulty.toLowerCase();
  if (d.includes('easy')) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/50 uppercase tracking-wide mr-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] print:border-emerald-300 print:shadow-none">EASY</span>;
  }
  if (d.includes('moderate') || d.includes('medium')) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200/50 uppercase tracking-wide mr-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] print:border-amber-300 print:shadow-none">MODERATE</span>;
  }
  if (d.includes('challenging') || d.includes('hard') || d.includes('difficult')) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200/50 uppercase tracking-wide mr-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] print:border-rose-300 print:shadow-none">CHALLENGING</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200/50 uppercase tracking-wide mr-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] print:border-slate-300 print:shadow-none">{difficulty}</span>;
};

export default function OutputPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newJobId, setNewJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAssignment = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/assignments/${id}`);
        const json = await res.json();

        if (json.success && json.data.result) {
          setPaperData(json.data.result);
          setAssignmentData(json.data);
        } else {
          setError('Failed to load generated paper. It may not be ready yet.');
        }
      } catch (e) {
        setError('Error fetching data from server.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('job_completed', (data) => {
      if (newJobId && data.assignmentId === newJobId) {
        setIsGenerating(false);
        router.push(`/output/${newJobId}`);
      }
    });

    socket.on('job_failed', (data) => {
      if (newJobId && data.assignmentId === newJobId) {
        setIsGenerating(false);
        alert('Regeneration failed. Please try again.');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [newJobId, router]);

  const handleRegenerate = async () => {
    if (!assignmentData) return;
    setIsGenerating(true);
    try {
      const payload = {
        title: assignmentData.title,
        schoolName: assignmentData.schoolName,
        subject: assignmentData.subject,
        className: assignmentData.className,
        timeAllowed: assignmentData.timeAllowed,
        numQuestions: assignmentData.totalQuestions,
        totalMarks: assignmentData.totalMarks,
        dueDate: assignmentData.dueDate,
        questionTypes: assignmentData.questionTypes,
        additionalInstructions: assignmentData.additionalInstructions
      };

      const res = await fetch('http://localhost:5000/api/assignments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setNewJobId(json.assignmentId);
      }
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      alert('Failed to request regeneration.');
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading || isGenerating) {
    return (
      <div className="w-full h-full min-h-screen bg-[#EAEAEA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="font-semibold text-gray-700">
            {isGenerating ? 'Regenerating your assignment...' : 'Loading your generated paper...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !paperData) {
    return (
      <div className="w-full h-full min-h-screen bg-[#EAEAEA] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <p className="font-bold text-red-500 text-xl mb-2">Oops!</p>
          <p className="text-gray-700 font-medium">{error || 'Could not find the requested paper.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full py-8 md:py-12 px-4 md:px-8 font-sans text-gray-900 flex justify-center items-start print:p-0 print:m-0 print:block">
      <div className="max-w-4xl w-full print:max-w-none print:w-full">
        {/* Top Dark Header */}
        <div className="bg-[#333333] rounded-t-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md z-10 relative print:hidden">
          <div className="flex items-center gap-3">
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 bg-[#1F2023] text-white border border-white/20 px-5 py-2.5 rounded-full font-semibold hover:bg-black transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <RefreshCw className="w-5 h-5" /> Regenerate
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Download className="w-5 h-5" /> Download as PDF
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          <div ref={contentRef} className="p-8 md:p-14 bg-white text-black font-sans print:p-0">
            {/* School & Exam Header */}
            <div className="text-center mb-10 space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">{paperData.school}</h1>
              <h2 className="text-xl font-bold">Subject: {paperData.subject}</h2>
              <h3 className="text-xl font-bold">Class: {paperData.class}</h3>
            </div>

            {/* Meta Info */}
            <div className="flex justify-between items-center text-sm font-bold mb-6">
              <span>Time Allowed: {paperData.timeAllowed}</span>
              <span>Maximum Marks: {paperData.maxMarks}</span>
            </div>

            <p className="text-sm font-bold mb-8">All questions are compulsory unless stated otherwise.</p>

            {/* Student Details */}
            <div className="space-y-4 mb-12 text-sm font-bold tracking-tight">
              <div>Name: ____________________________</div>
              <div>Roll Number: _____________________</div>
            </div>

            {/* Questions Section */}
            {paperData.sections.map((section, sIndex) => (
              <div key={sIndex} className="mb-10">
                <h3 className="text-center font-bold text-xl mb-6">{section.title}</h3>
                <div className="mb-8">
                  <h4 className="font-bold text-[15px]">{section.type}</h4>
                  <p className="text-sm italic text-gray-700">{section.instructions}</p>
                </div>

                <div className="space-y-5">
                  {section.questions.map((q, qIndex) => (
                    <div key={qIndex} className="flex gap-2 text-[15px] leading-relaxed print:break-inside-avoid">
                      <span className="shrink-0 font-medium pt-0.5">{q.id}.</span>
                      <div className="flex-1">
                        <p className="inline leading-relaxed">
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="text-gray-900">{q.text}</span>
                          <span className="text-gray-500 font-medium ml-2 whitespace-nowrap text-sm">[{q.marks} Marks]</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="font-bold text-[15px] mb-12">End of Question Paper</div>

            {/* Answer Key */}
            <div className="mt-16 pt-8">
              <h3 className="font-bold text-lg mb-6">Answer Key:</h3>
              <div className="space-y-6">
                {paperData.sections.map((section) => (
                  <div key={section.title} className="space-y-5">
                    {section.questions.map((q, qIndex) => (
                      <div key={qIndex} className="flex gap-2 text-[15px] leading-relaxed print:break-inside-avoid">
                        <span className="shrink-0 font-medium">{q.id}.</span>
                        <div className="space-y-1">
                          {q.answer.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
