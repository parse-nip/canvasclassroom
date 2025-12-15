import React, { useMemo, useState } from 'react';
import { LessonPlan, Submission, Student, StepHistory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaChartLine, FaCircleCheck, FaClock, FaTrophy, FaTriangleExclamation, FaArrowLeft, FaBookOpen, FaCode } from 'react-icons/fa6';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface StudentAnalyticsProps {
  student: Student;
  lessons: LessonPlan[];
  submissions: Submission[];
  onBack: () => void;
}

const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({
  student,
  lessons,
  submissions,
  onBack
}) => {
  const studentSubmissions = useMemo(() => 
    submissions.filter(s => s.studentId === student.id),
    [submissions, student.id]
  );

  // Progress over time
  const progressData = useMemo(() => {
    const sortedSubmissions = [...studentSubmissions]
      .filter(s => s.submittedAt)
      .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));

    let cumulative = 0;
    return sortedSubmissions.map((sub, idx) => {
      if (sub.status === 'Graded' || sub.status === 'Submitted') cumulative++;
      const lesson = lessons.find(l => l.id === sub.lessonId);
      return {
        date: new Date(sub.submittedAt!).toLocaleDateString(),
        completed: cumulative,
        grade: sub.feedback?.grade || null,
        lesson: lesson?.title || 'Unknown'
      };
    });
  }, [studentSubmissions, lessons]);

  // Grade trend
  const gradeData = useMemo(() => {
    return studentSubmissions
      .filter(s => s.status === 'Graded' && s.feedback)
      .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0))
      .map(sub => {
        const lesson = lessons.find(l => l.id === sub.lessonId);
        return {
          name: lesson?.title.substring(0, 15) || 'Unknown',
          grade: sub.feedback?.grade || 0
        };
      });
  }, [studentSubmissions, lessons]);

  // Concept mastery (by tags)
  const conceptMastery = useMemo(() => {
    const tagStats: { [tag: string]: { total: number; passed: number } } = {};

    studentSubmissions.forEach(sub => {
      if (sub.status !== 'Graded') return;
      const lesson = lessons.find(l => l.id === sub.lessonId);
      if (!lesson?.tags) return;

      lesson.tags.forEach(tag => {
        if (!tagStats[tag]) tagStats[tag] = { total: 0, passed: 0 };
        tagStats[tag].total++;
        if (sub.feedback && sub.feedback.grade >= 70) tagStats[tag].passed++;
      });
    });

    return Object.entries(tagStats)
      .map(([tag, stats]) => ({
        tag,
        mastery: Math.round((stats.passed / stats.total) * 100),
        lessons: stats.total
      }))
      .sort((a, b) => b.lessons - a.lessons)
      .slice(0, 8);
  }, [studentSubmissions, lessons]);

  // Radar chart data for concepts
  const radarData = conceptMastery.map(c => ({
    concept: c.tag,
    mastery: c.mastery
  }));

  // Overall stats
  const stats = useMemo(() => {
    const completed = studentSubmissions.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
    const graded = studentSubmissions.filter(s => s.status === 'Graded');
    const avgGrade = graded.length > 0
      ? Math.round(graded.reduce((sum, s) => sum + (s.feedback?.grade || 0), 0) / graded.length)
      : null;
    const totalTime = studentSubmissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
    const avgTime = completed > 0 ? Math.round(totalTime / completed / 60000) : 0;

    // Find struggles (steps with failed attempts)
    let totalAttempts = 0;
    let failedAttempts = 0;
    studentSubmissions.forEach(s => {
      if (s.history) {
        s.history.forEach(h => {
          totalAttempts++;
          if (!h.passed) failedAttempts++;
        });
      }
    });
    const successRate = totalAttempts > 0 ? Math.round((1 - failedAttempts / totalAttempts) * 100) : null;

    return { completed, total: lessons.length, avgGrade, avgTime, successRate };
  }, [studentSubmissions, lessons]);

  // Struggling areas (lessons with low grades or many attempts)
  const strugglingAreas = useMemo(() => {
    return studentSubmissions
      .filter(s => s.feedback && s.feedback.grade < 70)
      .map(sub => {
        const lesson = lessons.find(l => l.id === sub.lessonId);
        return {
          lesson: lesson?.title || 'Unknown',
          grade: sub.feedback?.grade || 0,
          tags: lesson?.tags || []
        };
      })
      .slice(0, 5);
  }, [studentSubmissions, lessons]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return studentSubmissions
      .filter(s => s.submittedAt)
      .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
      .slice(0, 5)
      .map(sub => {
        const lesson = lessons.find(l => l.id === sub.lessonId);
        return {
          id: sub.id,
          lesson: lesson?.title || 'Unknown',
          status: sub.status,
          grade: sub.feedback?.grade,
          date: new Date(sub.submittedAt!).toLocaleDateString()
        };
      });
  }, [studentSubmissions, lessons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <FaArrowLeft className="mr-2" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            {student.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {student.email || ''} {student.studentId && `• ID: ${student.studentId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FaCircleCheck className="mx-auto text-2xl text-green-500 mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.completed}/{stats.total}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FaTrophy className="mx-auto text-2xl text-amber-500 mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.avgGrade !== null ? `${stats.avgGrade}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Avg Grade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FaClock className="mx-auto text-2xl text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.avgTime > 0 ? `${stats.avgTime}m` : 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Avg Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FaCode className="mx-auto text-2xl text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.successRate !== null ? `${stats.successRate}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Step Success</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="grade" stroke="#6366f1" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                No graded submissions yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Concept Mastery Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Concept Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="concept" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Mastery" dataKey="mastery" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                No concept data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaBookOpen className="text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{activity.lesson}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{activity.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      activity.status === 'Graded' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : activity.status === 'Submitted'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {activity.status}
                    </span>
                    {activity.grade !== undefined && (
                      <span className="font-bold text-slate-900 dark:text-white">{activity.grade}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No activity yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Struggling Areas */}
      {strugglingAreas.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <FaTriangleExclamation /> Areas Needing Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strugglingAreas.map((area, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{area.lesson}</div>
                    <div className="flex gap-1 mt-1">
                      {area.tags.map((tag, tidx) => (
                        <span key={tidx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {area.grade}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concept Mastery List */}
      {conceptMastery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Concept Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conceptMastery.map((concept, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{concept.tag}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{concept.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          concept.mastery >= 80 ? 'bg-green-500' :
                          concept.mastery >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${concept.mastery}%` }}
                      />
                    </div>
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

export default StudentAnalytics;

