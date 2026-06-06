'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutGrid, Users, FileText, Settings, Sparkles, BookOpen, Bell, ChevronLeft, ChevronDown, Menu } from 'lucide-react';

export default function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/') return 'Assignments';
    if (pathname === '/create') return 'Create Assignment';
    if (pathname === '/output') return 'Assignment Output';
    return 'Dashboard';
  };

  const [assignmentCount, setAssignmentCount] = useState<number>(0);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/assignments');
        const json = await res.json();
        if (json.success) {
          setAssignmentCount(json.data.length);
        }
      } catch (e) {
        console.error('Failed to fetch assignments count', e);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="flex h-[100dvh] bg-[#EAEAEA] overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white m-3 rounded-[1.5rem] shadow-sm flex-shrink-0 relative z-20 overflow-y-auto overflow-x-hidden print:hidden">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 font-extrabold text-2xl tracking-tight text-gray-800">
          <img src="/logo.svg" alt="VedaAI Logo" className="w-10 h-10 rounded-xl object-contain" />
          VedaAI
        </div>

        {/* AI Toolkit Button */}
        <div className="px-5 mb-4">
          <button className="w-full bg-[#1F2023] text-white py-3.5 px-4 rounded-[1.25rem] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-black/10 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent pointer-events-none"></div>
            <Sparkles className="w-4 h-4 text-orange-400 relative z-10" />
            <span className="text-[14px] relative z-10">AI Teacher's Toolkit</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-semibold text-[14px] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
            <LayoutGrid className="w-5 h-5 text-gray-400" /> Home
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-semibold text-[14px] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 text-gray-400" /> My Groups
          </Link>
          <Link href="/" className={`flex items-center justify-between px-4 py-3.5 rounded-[1.25rem] font-semibold text-[14px] transition-colors ${pathname === '/' || pathname === '/create' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <FileText className={`w-5 h-5 ${pathname === '/' || pathname === '/create' ? 'text-black' : 'text-gray-400'}`} /> Assignments
            </div>
            {assignmentCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{assignmentCount}</span>
            )}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-semibold text-[14px] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
            <Sparkles className="w-5 h-5 text-gray-400" /> AI Teacher's Toolkit
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-semibold text-[14px] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
            <BookOpen className="w-5 h-5 text-gray-400" /> My Library
          </Link>
        </nav>

        {/* Settings & School Info */}
        <div className="p-3 mt-4">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 mb-2 font-semibold text-[14px] text-gray-500 hover:text-black transition-colors rounded-[1.25rem] hover:bg-gray-50">
            <Settings className="w-5 h-5 text-gray-400" /> Settings
          </Link>

          <div className="bg-gray-100/70 rounded-[1.25rem] p-4 flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shrink-0">
              <img src="https://ui-avatars.com/api/?name=DP&background=random" alt="DPS" className="w-8 h-8 rounded-full" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-bold text-gray-900 truncate">Delhi Public School</div>
              <div className="text-[11px] font-medium text-gray-500 truncate">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Top Header (Desktop) */}
        <header className="hidden md:flex h-24 items-center justify-between px-8 shrink-0 z-10 w-full max-w-6xl mx-auto print:hidden">
          <div className="flex items-center gap-4 text-gray-500 font-semibold">
            <Link href="/" className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-black" />
            </Link>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-gray-400" />
              <span className="text-gray-800">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex items-center gap-3 cursor-pointer bg-white pl-1.5 pr-4 py-1.5 rounded-full shadow-sm hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
              <img src="https://i.pravatar.cc/100?img=11" alt="User" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-[14px] font-bold text-gray-900">John Doe</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Mobile Global Top Header (matches design) */}
        <header className="md:hidden bg-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm print:hidden">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <img src="/logo.svg" alt="VedaAI Logo" className="w-8 h-8 rounded-lg object-contain" />
            VedaAI
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img src="https://i.pravatar.cc/100?img=11" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <Menu className="w-6 h-6 text-gray-800" />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto relative pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
