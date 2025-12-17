import React, { useState } from 'react';
import { LessonPlan } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaDownload, FaUpload, FaCopy, FaBookOpen, FaClipboardCheck, FaMagnifyingGlass, FaBookmark, FaFileExport, FaFileImport } from 'react-icons/fa6';

interface LessonLibraryProps {
  lessons: LessonPlan[];
  onDuplicateLesson: (lesson: LessonPlan) => void;
  onImportLesson: (lesson: LessonPlan) => void;
  onSaveAsTemplate: (lesson: LessonPlan) => void;
  classId: string;
}

const LessonLibrary: React.FC<LessonLibraryProps> = ({
  lessons,
  onDuplicateLesson,
  onImportLesson,
  onSaveAsTemplate,
  classId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Lesson' | 'Assignment'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || lesson.type === filterType;
    const matchesDifficulty = !filterDifficulty || lesson.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  // Templates vs regular lessons
  const templates = filteredLessons.filter(l => l.isTemplate);
  const classLessons = filteredLessons.filter(l => !l.isTemplate && l.classId === classId);

  const handleExportLesson = (lesson: LessonPlan) => {
    const exportData = {
      ...lesson,
      id: undefined, // Remove ID for fresh import
      classId: undefined,
      unitId: undefined,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lesson_${lesson.title.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const handleExportAll = () => {
    const exportData = {
      lessons: classLessons.map(l => ({
        ...l,
        id: undefined,
        classId: undefined,
        unitId: undefined
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lessons_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importJson);
      
      // Handle single lesson or multiple lessons
      if (data.lessons && Array.isArray(data.lessons)) {
        data.lessons.forEach((lesson: LessonPlan) => {
          onImportLesson({
            ...lesson,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            classId
          });
        });
      } else {
        onImportLesson({
          ...data,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          classId
        });
      }
      
      setImportJson('');
      setShowImportDialog(false);
    } catch (e) {
      alert('Invalid JSON format. Please check your import data.');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportJson(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lesson Library</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, duplicate, and share lessons
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <FaFileImport className="mr-2" /> Import
          </Button>
          <Button variant="outline" onClick={handleExportAll}>
            <FaFileExport className="mr-2" /> Export All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lessons by title, objective, or tag..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="all">All Types</option>
          <option value="Lesson">Lessons</option>
          <option value="Assignment">Assignments</option>
        </select>
        <select
          className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2"
          value={filterDifficulty || ''}
          onChange={(e) => setFilterDifficulty(e.target.value || null)}
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
          <CardHeader>
            <CardTitle>Import Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Upload JSON file or paste JSON:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200"
              />
            </div>
            <textarea
              className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 font-mono text-sm"
              rows={6}
              placeholder="Paste exported lesson JSON here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={!importJson.trim()}>
                Import Lesson
              </Button>
              <Button variant="secondary" onClick={() => { setShowImportDialog(false); setImportJson(''); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Section */}
      {templates.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <FaBookmark className="text-amber-500" /> Saved Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onDuplicate={() => onDuplicateLesson(lesson)}
                onExport={() => handleExportLesson(lesson)}
                isTemplate
              />
            ))}
          </div>
        </div>
      )}

      {/* Class Lessons */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
          Class Lessons ({classLessons.length})
        </h3>
        {classLessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-400">
              <FaBookOpen className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No lessons match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onDuplicate={() => onDuplicateLesson(lesson)}
                onExport={() => handleExportLesson(lesson)}
                onSaveAsTemplate={() => onSaveAsTemplate(lesson)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Lesson Card Component
interface LessonCardProps {
  lesson: LessonPlan;
  onDuplicate: () => void;
  onExport: () => void;
  onSaveAsTemplate?: () => void;
  isTemplate?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onDuplicate, onExport, onSaveAsTemplate, isTemplate }) => {
  return (
    <Card className={isTemplate ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            lesson.type === 'Assignment' 
              ? 'bg-pink-100 text-pink-500 dark:bg-pink-900 dark:text-pink-300' 
              : 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-300'
          }`}>
            {lesson.type === 'Assignment' ? <FaClipboardCheck /> : <FaBookOpen />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{lesson.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{lesson.objective}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            lesson.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {lesson.difficulty}
          </span>
          {lesson.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onDuplicate} className="flex-1">
            <FaCopy className="mr-1" /> Duplicate
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            <FaDownload />
          </Button>
          {onSaveAsTemplate && !isTemplate && (
            <Button size="sm" variant="outline" onClick={onSaveAsTemplate}>
              <FaBookmark />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonLibrary;

