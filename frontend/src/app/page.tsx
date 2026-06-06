'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Plus, LayoutGrid, Calendar, BookOpen, Sparkles, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Assignment {
  _id: string;
  dueDate: string;
  createdAt: string;
  questionTypes: any[];
  title?: string; // We might not have 'title' in backend yet, we'll fake it or use a default if missing
}

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assignments');
      const json = await res.json();
      if (json.success) {
        setAssignments(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/assignments/${id}`, {
        method: 'DELETE'
      });
      fetchAssignments();
      setOpenDropdownId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredAssignments = assignments.filter(a => {
    const title = a.title || 'Untitled Assignment';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full min-h-full font-sans text-gray-900 px-4 md:px-8 pt-6 pb-24 md:pb-8">
      
      {/* Top Mobile padding adjusted */}

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        
        {/* Page Title & Back (Mobile style header) */}
        <div className="flex items-center justify-center relative mb-6">
          <div className="absolute left-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer md:hidden">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <h1 className="text-lg md:text-3xl font-bold">Assignments</h1>
        </div>

        {/* Filter & Search */}
        <div className="flex gap-3 mb-6">
          <button className="flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm text-gray-500 font-medium shrink-0 border border-gray-100">
            <Filter className="w-5 h-5" /> Filter
          </button>
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Name" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-700 border border-gray-100 font-medium"
            />
          </div>
          
          {/* Desktop Create Button (Only visible when items exist or we can just always show it, but requirement says "whenever the list is populated") */}
          {!loading && assignments.length > 0 && (
            <Link 
              href="/create" 
              className="hidden md:flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl shadow-sm hover:bg-black font-semibold shrink-0 transition-colors"
            >
              <Plus className="w-5 h-5" /> Create Assignment
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
           <div className="flex justify-center items-center py-20">
             <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
           </div>
        )}

        {/* Empty State */}
        {!loading && filteredAssignments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center mt-8">
            <div className="relative mb-8 text-gray-300">
               {/* Composed Empty State Illustration */}
               <div className="w-48 h-48 bg-white rounded-full shadow-inner flex items-center justify-center relative">
                 <SearchX className="w-24 h-24 text-gray-400 relative z-10" />
                 <div className="absolute -top-4 -left-4 w-12 h-12 border-2 border-gray-400 rounded-full" />
                 <div className="absolute bottom-4 -right-2 w-4 h-4 bg-blue-400 rounded-full" />
                 <div className="absolute top-1/4 right-4 w-8 h-4 bg-gray-200 rounded-full" />
               </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight">No assignments yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed font-medium">
              Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
            <Link 
              href="/create"
              className="bg-[#1A1A1A] text-white px-6 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-black transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" /> Create Your First Assignment
            </Link>
          </div>
        )}

        {/* Assignments List */}
        {!loading && filteredAssignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment._id} 
                onClick={() => router.push(`/output/${assignment._id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  {/* Title with serif font to match requirement */}
                  <h3 className="font-serif font-bold text-[1.1rem] text-gray-900 tracking-tight">
                    {assignment.title || 'Untitled Assignment'}
                  </h3>
                  
                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === assignment._id ? null : assignment._id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    {openDropdownId === assignment._id && (
                      <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-10">
                        <Link href={`/output/${assignment._id}`} onClick={(e) => e.stopPropagation()} className="block px-4 py-2 text-sm text-black font-semibold hover:bg-gray-50">
                          View Assignment
                        </Link>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(assignment._id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 font-semibold hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-800">
                  <span>Assigned on : <span className="text-gray-500 font-medium">{formatDate(assignment.createdAt) || '20-06-2025'}</span></span>
                  <span>Due : <span className="text-gray-500 font-medium">{formatDate(assignment.dueDate) || '21-06-2025'}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB for mobile when items exist */}
      {!loading && filteredAssignments.length > 0 && (
        <div className="fixed bottom-[100px] right-6 md:hidden z-30">
          <Link href="/create" className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-xl border border-gray-100">
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-20">
        <div className="bg-[#1A1A1A] rounded-[2rem] px-2 py-4 flex justify-between items-center shadow-2xl">
          <button className="flex flex-col items-center justify-center flex-1 gap-1 text-gray-500 hover:text-white transition-colors">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          
          <button className="flex flex-col items-center justify-center flex-1 gap-1 text-white">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Assignments</span>
          </button>
          
          <button className="flex flex-col items-center justify-center flex-1 gap-1 text-gray-500 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Library</span>
          </button>
          
          <button className="flex flex-col items-center justify-center flex-1 gap-1 text-gray-500 hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-semibold">AI Toolkit</span>
          </button>
        </div>
      </div>

    </div>
  );
}
