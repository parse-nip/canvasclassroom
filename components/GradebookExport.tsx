import React, { useState } from 'react';
import { LessonPlan, Submission, Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaDownload, FaFileExcel, FaFileCsv, FaTable } from 'react-icons/fa6';

interface GradebookExportProps {
  lessons: LessonPlan[];
  submissions: Submission[];
  students: Student[];
  className: string;
}

const GradebookExport: React.FC<GradebookExportProps> = ({
  lessons,
  submissions,
  students,
  className
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeUngraded, setIncludeUngraded] = useState(true);

  // Build gradebook data
  const getGradebookData = () => {
    return students.map(student => {
      const studentData: any = {
        'Student Name': student.name,
        'Student ID': student.studentId || '',
        'Email': student.email || ''
      };

      let totalPoints = 0;
      let earnedPoints = 0;
      let gradedCount = 0;

      lessons.forEach(lesson => {
        const submission = submissions.find(
          s => s.studentId === student.id && s.lessonId === lesson.id
        );

        if (submission?.status === 'Graded' && submission.feedback) {
          studentData[lesson.title] = submission.feedback.grade;
          totalPoints += 100;
          earnedPoints += submission.feedback.grade;
          gradedCount++;
        } else if (submission?.status === 'Submitted') {
          studentData[lesson.title] = includeUngraded ? 'Submitted' : '';
        } else if (submission?.status === 'Draft') {
          studentData[lesson.title] = includeUngraded ? 'In Progress' : '';
        } else {
          studentData[lesson.title] = includeUngraded ? 'Not Started' : '';
        }
      });

      // Calculate average
      studentData['Average'] = gradedCount > 0 
        ? Math.round(earnedPoints / gradedCount) 
        : 'N/A';
      studentData['Completed'] = `${gradedCount}/${lessons.length}`;

      return studentData;
    });
  };

  const exportToCSV = () => {
    const data = getGradebookData();
    if (data.length === 0) return;

    // Get all headers
    const headers = Object.keys(data[0]);
    
    // Build CSV content
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += headers.map(h => {
        const value = row[h]?.toString() || '';
        // Escape commas and quotes
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',') + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${className.replace(/\s+/g, '_')}_gradebook_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const data = getGradebookData();
    const exportData = {
      className,
      exportDate: new Date().toISOString(),
      students: data,
      lessons: lessons.map(l => ({
        id: l.id,
        title: l.title,
        type: l.type,
        difficulty: l.difficulty
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${className.replace(/\s+/g, '_')}_gradebook_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  // Preview data
  const previewData = getGradebookData().slice(0, 5);
  const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center hidden">
         {/* Header handled by TeacherDashboard now */}
      </div>

      {/* Export Options */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
              Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat('csv')}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all ${
                  exportFormat === 'csv'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-3 rounded-full ${exportFormat === 'csv' ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <FaFileCsv className="text-2xl" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">CSV</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Excel, Google Sheets</div>
                </div>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all ${
                  exportFormat === 'json'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-3 rounded-full ${exportFormat === 'json' ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <FaTable className="text-2xl" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">JSON</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Backup, API import</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUngraded}
                onChange={(e) => setIncludeUngraded(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Include ungraded submissions <span className="text-slate-400 font-normal">(shows "Submitted", "In Progress", etc.)</span>
              </span>
            </label>
          </div>

          <Button onClick={handleExport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg shadow-lg shadow-indigo-500/20">
            <FaDownload className="mr-2" /> Export Gradebook
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <CardTitle>Preview <span className="text-sm font-normal text-slate-500 ml-2">(First 5 Students)</span></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  {headers.slice(0, 6).map((header, idx) => (
                    <th key={idx} className="text-left py-3 px-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                  {headers.length > 6 && (
                    <th className="text-left py-3 px-4 font-bold text-slate-400">
                      +{headers.length - 6} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {headers.slice(0, 6).map((header, hidx) => (
                      <td key={hidx} className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row[header]?.toString() || <span className="text-slate-300">-</span>}
                      </td>
                    ))}
                    {headers.length > 6 && <td className="py-3 px-4 text-slate-400">...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradebookExport;