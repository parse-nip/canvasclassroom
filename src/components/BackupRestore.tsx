import React, { useState } from 'react';
import { Class, LessonPlan, Unit, Student, Submission, Announcement } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaDownload, FaUpload, FaDatabase, FaCloudArrowUp, FaTriangleExclamation, FaCircleCheck } from 'react-icons/fa6';

interface BackupRestoreProps {
  currentClass: Class | null;
  lessons: LessonPlan[];
  units: Unit[];
  students: Student[];
  submissions: Submission[];
  announcements: Announcement[];
  onRestore: (data: BackupData) => void;
}

interface BackupData {
  version: string;
  exportedAt: string;
  class: Class;
  lessons: LessonPlan[];
  units: Unit[];
  students: Student[];
  submissions: Submission[];
  announcements: Announcement[];
}

const BackupRestore: React.FC<BackupRestoreProps> = ({
  currentClass,
  lessons,
  units,
  students,
  submissions,
  announcements,
  onRestore
}) => {
  const [restoreJson, setRestoreJson] = useState('');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restorePreview, setRestorePreview] = useState<BackupData | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const createBackup = (): BackupData | null => {
    if (!currentClass) return null;
    
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      class: currentClass,
      lessons: lessons.filter(l => l.classId === currentClass.id),
      units: units.filter(u => u.classId === currentClass.id),
      students: students,
      submissions: submissions.filter(s => s.classId === currentClass.id),
      announcements: announcements.filter(a => a.classId === currentClass.id)
    };
  };

  const handleBackup = () => {
    const data = createBackup();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${currentClass?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    setLastBackup(new Date().toLocaleString());
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      setRestoreJson(json);
      try {
        const data = JSON.parse(json) as BackupData;
        setRestorePreview(data);
      } catch {
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!restorePreview) return;
    
    if (confirm('This will replace all current data with the backup. Are you sure?')) {
      onRestore(restorePreview);
      setShowRestoreDialog(false);
      setRestoreJson('');
      setRestorePreview(null);
    }
  };

  const backupData = createBackup();
  const stats = backupData ? {
    lessons: backupData.lessons.length,
    units: backupData.units.length,
    students: backupData.students.length,
    submissions: backupData.submissions.length,
    announcements: backupData.announcements.length
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Backup & Restore</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Protect your class data
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-300">
              <FaCloudArrowUp /> Create Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              Download a complete backup of your class data including lessons, students, submissions, and more.
            </p>
            
            {stats && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-1">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Backup will include:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div>{stats.lessons} lessons</div>
                  <div>{stats.units} units</div>
                  <div>{stats.students} students</div>
                  <div>{stats.submissions} submissions</div>
                  <div>{stats.announcements} announcements</div>
                </div>
              </div>
            )}

            <Button onClick={handleBackup} className="w-full bg-green-600 hover:bg-green-700">
              <FaDownload className="mr-2" /> Download Backup
            </Button>

            {lastBackup && (
              <div className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                <FaCircleCheck /> Last backup: {lastBackup}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restore */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <FaDatabase /> Restore from Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Restore your class from a previously downloaded backup file.
            </p>
            
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <FaTriangleExclamation className="text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Warning:</strong> Restoring will replace all current data for this class. Make sure to backup first!
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowRestoreDialog(true)}
              className="w-full border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <FaUpload className="mr-2" /> Restore from File
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Restore Dialog */}
      {showRestoreDialog && (
        <Card>
          <CardHeader>
            <CardTitle>Restore from Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select backup file:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200"
              />
            </div>

            {restorePreview && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Backup Preview:</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div>Class: {restorePreview.class.name}</div>
                  <div>Exported: {new Date(restorePreview.exportedAt).toLocaleDateString()}</div>
                  <div>{restorePreview.lessons.length} lessons</div>
                  <div>{restorePreview.units.length} units</div>
                  <div>{restorePreview.students.length} students</div>
                  <div>{restorePreview.submissions.length} submissions</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleRestore} 
                disabled={!restorePreview}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Restore Backup
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowRestoreDialog(false);
                setRestoreJson('');
                setRestorePreview(null);
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <FaCircleCheck className="text-green-500 mt-1 shrink-0" />
              <span>Create backups regularly, especially before making major changes</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCircleCheck className="text-green-500 mt-1 shrink-0" />
              <span>Store backups in a safe location (cloud storage, external drive)</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCircleCheck className="text-green-500 mt-1 shrink-0" />
              <span>Backup files are portable - use them to transfer classes between accounts</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCircleCheck className="text-green-500 mt-1 shrink-0" />
              <span>Each class is backed up separately for easy management</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;

