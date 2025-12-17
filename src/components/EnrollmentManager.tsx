import React, { useState } from 'react';
import { Enrollment, Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaCheck, FaXmark, FaUserPlus, FaClock, FaCopy } from 'react-icons/fa6';
import { supabaseService } from '../services/supabaseService';

interface EnrollmentManagerProps {
  classId: string;
  classCode: string;
  enrollments: Enrollment[];
  students: Student[];
  onEnrollmentUpdate: (enrollment: Enrollment) => void;
  onStudentAdded: (student: Student) => void;
}

const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({
  classId,
  classCode,
  enrollments,
  students,
  onEnrollmentUpdate,
  onStudentAdded
}) => {
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>(
    enrollments.filter(e => e.status === 'pending')
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const handleApprove = async (enrollment: Enrollment) => {
    const updated = await supabaseService.updateEnrollmentStatus(enrollment.id, 'approved');
    setPendingEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
    onEnrollmentUpdate(updated);
    
    // If student doesn't exist, create them
    let student = students.find(s => s.id === enrollment.studentId);
    if (!student) {
      // In real implementation, we'd fetch student data from enrollment request
      // For now, create a placeholder student
      student = await supabaseService.createStudent({
        name: `Student ${enrollment.studentId.slice(-4)}`, // Placeholder
        isActive: true
      });
      onStudentAdded(student);
    }
  };

  const handleReject = async (enrollment: Enrollment) => {
    const updated = await supabaseService.updateEnrollmentStatus(enrollment.id, 'rejected');
    setPendingEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
    onEnrollmentUpdate(updated);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Class Code Display */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
          <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <FaUserPlus className="text-indigo-500" /> Enrollment Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                  <div className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {classCode}
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Active
                  </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Share this code with students. They can use it to request enrollment.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
               <div className="flex gap-2">
                  <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/enroll/${classCode}`}
                      className="flex-1 md:w-64 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 text-sm bg-slate-50"
                  />
                  <Button
                      variant="outline"
                      onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/enroll/${classCode}`);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                      }}
                  >
                      <FaCopy />
                  </Button>
               </div>
               <Button
                  onClick={handleCopyCode}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                  <FaCopy className="mr-2" />
                  {copiedCode ? 'Copied Code!' : 'Copy Code Only'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Enrollments */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
               <FaClock className="text-amber-500" /> Pending Enrollment Requests
            </CardTitle>
            {pendingEnrollments.length > 0 && (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                {pendingEnrollments.length} pending
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pendingEnrollments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FaUserPlus className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No pending enrollment requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingEnrollments.map((enrollment) => {
                const student = students.find(s => s.id === enrollment.studentId);
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                        {student?.avatar || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {student?.name || `Student ${enrollment.studentId.slice(-4)}`}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                           Requested {new Date(enrollment.requestedAt).toLocaleDateString()} at {new Date(enrollment.requestedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(enrollment)}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        <FaCheck className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(enrollment)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <FaXmark className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Students Count */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <CardTitle>Enrollment Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {enrollments.filter(e => e.status === 'approved').length}
              </div>
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-1 uppercase tracking-wider">Approved</div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/50">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {enrollments.filter(e => e.status === 'pending').length}
              </div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-1 uppercase tracking-wider">Pending</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-3xl font-bold text-slate-400">
                {enrollments.filter(e => e.status === 'rejected').length}
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentManager;