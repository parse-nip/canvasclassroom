import React, { useMemo } from 'react';
import { LessonPlan, Submission, Student, Unit } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { FaChartLine, FaUsers, FaCircleCheck, FaClock, FaTriangleExclamation, FaTrophy } from 'react-icons/fa6';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsDashboardProps {
  lessons: LessonPlan[];
  units: Unit[];
  submissions: Submission[];
  students: Student[];
  classId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  lessons,
  units,
  submissions,
  students,
  classId
}) => {
  // Calculate completion rates per lesson
  const lessonCompletionData = useMemo(() => {
    return lessons.map(lesson => {
      const lessonSubmissions = submissions.filter(s => s.lessonId === lesson.id);
      const completed = lessonSubmissions.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
      const completionRate = students.length > 0 ? (completed / students.length) * 100 : 0;
      
      return {
        name: lesson.title.length > 20 ? lesson.title.substring(0, 20) + '...' : lesson.title,
        fullName: lesson.title,
        completed,
        total: students.length,
        rate: Math.round(completionRate),
        pending: lessonSubmissions.filter(s => s.status === 'Draft').length
      };
    });
  }, [lessons, submissions, students]);

  // Calculate average grades per lesson
  const averageGradesData = useMemo(() => {
    return lessons.map(lesson => {
      const gradedSubmissions = submissions.filter(
        s => s.lessonId === lesson.id && s.status === 'Graded' && s.feedback
      );
      const avgGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.feedback?.grade || 0), 0) / gradedSubmissions.length
        : 0;
      
      return {
        name: lesson.title.length > 15 ? lesson.title.substring(0, 15) + '...' : lesson.title,
        fullName: lesson.title,
        average: Math.round(avgGrade),
        count: gradedSubmissions.length
      };
    }).filter(d => d.count > 0);
  }, [lessons, submissions]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalLessons = lessons.length;
    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
    const gradedSubmissions = submissions.filter(s => s.status === 'Graded').length;
    const averageGrade = gradedSubmissions.length > 0
      ? submissions
          .filter(s => s.status === 'Graded' && s.feedback)
          .reduce((sum, s) => sum + (s.feedback?.grade || 0), 0) / gradedSubmissions.length
      : 0;
    
    // Calculate average time spent (if available)
    const submissionsWithTime = submissions.filter(s => s.timeSpent);
    const avgTimeSpent = submissionsWithTime.length > 0
      ? submissionsWithTime.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / submissionsWithTime.length
      : 0;

    return {
      totalLessons,
      totalSubmissions,
      completedSubmissions,
      completionRate: totalLessons > 0 && students.length > 0
        ? Math.round((completedSubmissions / (totalLessons * students.length)) * 100)
        : 0,
      averageGrade: Math.round(averageGrade),
      avgTimeSpent: Math.round(avgTimeSpent / 60000), // Convert to minutes
      gradedCount: gradedSubmissions
    };
  }, [lessons, submissions, students]);

  // Student progress data
  const studentProgressData = useMemo(() => {
    return students.map(student => {
      const studentSubmissions = submissions.filter(s => s.studentId === student.id);
      const completed = studentSubmissions.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
      const progress = lessons.length > 0 ? (completed / lessons.length) * 100 : 0;
      
      return {
        name: student.name,
        completed,
        total: lessons.length,
        progress: Math.round(progress)
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [students, submissions, lessons]);

  // Difficulty distribution
  const difficultyData = useMemo(() => {
    const beginner = lessons.filter(l => l.difficulty === 'Beginner').length;
    const intermediate = lessons.filter(l => l.difficulty === 'Intermediate').length;
    const advanced = lessons.filter(l => l.difficulty === 'Advanced').length;
    
    return [
      { name: 'Beginner', value: beginner, color: '#10b981' },
      { name: 'Intermediate', value: intermediate, color: '#f59e0b' },
      { name: 'Advanced', value: advanced, color: '#ef4444' }
    ];
  }, [lessons]);

  // Lessons that need attention (low completion rate)
  const strugglingLessons = useMemo(() => {
    return lessonCompletionData
      .filter(d => d.rate < 50 && d.total > 0)
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5);
  }, [lessonCompletionData]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {value}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <FaUsers className="text-indigo-600 dark:text-indigo-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{overallStats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FaCircleCheck className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Average Grade</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {overallStats.averageGrade > 0 ? overallStats.averageGrade : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FaTrophy className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg Time Spent</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {overallStats.avgTimeSpent > 0 ? `${overallStats.avgTimeSpent}m` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <FaClock className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Completion Chart */}
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle>Lesson Completion Rates</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {lessonCompletionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lessonCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#6366f1" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No completion data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle>Lesson Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {difficultyData.some(d => d.value > 0) ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {difficultyData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {entry.name}: {entry.value} ({difficultyData.reduce((a, b) => a + b.value, 0) > 0 
                          ? Math.round((entry.value / difficultyData.reduce((a, b) => a + b.value, 0)) * 100) 
                          : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No lessons yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Average Grades Chart */}
      {averageGradesData.length > 0 && (
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle>Average Grades by Lesson</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={averageGradesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#8b5cf6" name="Average Grade" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Student Progress Table */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <CardTitle>Student Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Student</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Completed</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Progress</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Bar</th>
                </tr>
              </thead>
              <tbody>
                {studentProgressData.map((student, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                      {student.completed} / {student.total}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-bold">
                      {student.progress}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Needing Attention */}
      {strugglingLessons.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <FaTriangleExclamation /> Lessons Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strugglingLessons.map((lesson, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{lesson.fullName}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {lesson.completed} of {lesson.total} students completed
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {lesson.rate}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;