import React, { useState } from 'react';
import { HelpRequest, Student, LessonPlan } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaHandsHolding, FaClock, FaCheck, FaEye, FaMessage, FaCircleExclamation } from 'react-icons/fa6';

interface HelpQueueProps {
  helpRequests: HelpRequest[];
  students: Student[];
  lessons: LessonPlan[];
  onResolveRequest: (requestId: string) => void;
  onStartHelping: (requestId: string) => void;
  onViewStudentCode?: (request: HelpRequest) => void;
}

const HelpQueue: React.FC<HelpQueueProps> = ({
  helpRequests,
  students,
  lessons,
  onResolveRequest,
  onStartHelping,
  onViewStudentCode
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress'>('pending');

  const filteredRequests = helpRequests.filter(r => {
    if (filterStatus === 'all') return r.status !== 'resolved';
    return r.status === filterStatus;
  }).sort((a, b) => a.createdAt - b.createdAt); // Oldest first (queue order)

  const pendingCount = helpRequests.filter(r => r.status === 'pending').length;
  const inProgressCount = helpRequests.filter(r => r.status === 'in-progress').length;

  const getTimeWaiting = (createdAt: number) => {
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const getPriorityClass = (createdAt: number) => {
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    if (minutes > 15) return 'border-l-4 border-l-red-500';
    if (minutes > 5) return 'border-l-4 border-l-amber-500';
    return 'border-l-4 border-l-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaHandsHolding className="text-indigo-500" /> Help Queue
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Students requesting assistance
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-full font-bold animate-pulse shadow-sm">
            {pendingCount} waiting
          </div>
        )}
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={`cursor-pointer transition-all border-none shadow-md overflow-hidden ${filterStatus === 'pending' ? 'ring-2 ring-indigo-500 transform scale-105' : 'bg-white dark:bg-slate-900 hover:bg-slate-50'}`}
              onClick={() => setFilterStatus('pending')}>
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waiting</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer transition-all border-none shadow-md overflow-hidden ${filterStatus === 'in-progress' ? 'ring-2 ring-indigo-500 transform scale-105' : 'bg-white dark:bg-slate-900 hover:bg-slate-50'}`}
              onClick={() => setFilterStatus('in-progress')}>
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Helping</div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer transition-all border-none shadow-md overflow-hidden ${filterStatus === 'all' ? 'ring-2 ring-indigo-500 transform scale-105' : 'bg-white dark:bg-slate-900 hover:bg-slate-50'}`}
              onClick={() => setFilterStatus('all')}>
          <div className="h-1 bg-slate-500"></div>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">{pendingCount + inProgressCount}</div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden min-h-[400px]">
        <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex justify-between items-center">
            <CardTitle>Queue List</CardTitle>
            
            {/* Priority Legend */}
            {filteredRequests.length > 0 && (
              <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>&lt; 5m</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>5-15m</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>&gt; 15m</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-slate-50/30 dark:bg-black/10">
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <FaHandsHolding className="text-3xl opacity-50 text-indigo-300" />
                </div>
                <p className="font-medium text-lg">All clear!</p>
                <p className="text-sm">No students need help right now.</p>
              </div>
            ) : (
              filteredRequests.map((request, idx) => {
                const student = students.find(s => s.id === request.studentId);
                const lesson = lessons.find(l => l.id === request.lessonId);
                const isInProgress = request.status === 'in-progress';

                return (
                  <div key={request.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${getPriorityClass(request.createdAt)} ${isInProgress ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-slate-300 dark:text-slate-600 w-6">
                          #{idx + 1}
                        </div>
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                            {student?.avatar || '?'}
                          </div>
                          {isInProgress && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800">
                              <FaEye size={10} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-lg">
                            {student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {lesson?.title || 'Unknown Lesson'}
                          </div>
                          {request.message && (
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                              <FaMessage className="text-indigo-400" /> "{request.message}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className={`flex items-center gap-1 text-sm font-bold ${isInProgress ? 'text-blue-600' : 'text-slate-500'}`}>
                            <FaClock /> {getTimeWaiting(request.createdAt)}
                          </div>
                          {isInProgress && (
                            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                              Being Helped
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {onViewStudentCode && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewStudentCode(request)}
                              className="h-9"
                            >
                              <FaEye className="mr-1" /> View Code
                            </Button>
                          )}
                          {!isInProgress ? (
                            <Button
                              size="sm"
                              onClick={() => onStartHelping(request.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 h-9"
                            >
                              Start Helping
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => onResolveRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700 h-9 shadow-green-500/20 shadow-lg"
                            >
                              <FaCheck className="mr-1" /> Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpQueue;