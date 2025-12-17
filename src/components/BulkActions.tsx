import React, { useState } from 'react';
import { LessonPlan, Unit, Submission, Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaCheck, FaLock, FaLockOpen, FaCopy, FaGraduationCap, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';

interface BulkActionsProps {
  lessons: LessonPlan[];
  units: Unit[];
  submissions: Submission[];
  students: Student[];
  onBulkUnlockUnits: (unitIds: string[]) => void;
  onBulkLockUnits: (unitIds: string[]) => void;
  onBulkAssignLesson: (lessonId: string, classIds: string[]) => void;
  onBulkGrade: (submissionIds: string[], grade: number, comment: string) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  lessons,
  units,
  submissions,
  students,
  onBulkUnlockUnits,
  onBulkLockUnits,
  onBulkAssignLesson,
  onBulkGrade
}) => {
  const [activeAction, setActiveAction] = useState<'unlock' | 'lock' | 'grade' | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [bulkGrade, setBulkGrade] = useState('');
  const [bulkComment, setBulkComment] = useState('');
  const [actionComplete, setActionComplete] = useState<string | null>(null);

  const pendingSubmissions = submissions.filter(s => s.status === 'Submitted');

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const toggleSubmission = (submissionId: string) => {
    setSelectedSubmissionIds(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const selectAllUnits = (locked: boolean) => {
    const filteredUnits = units.filter(u => u.isLocked === locked);
    setSelectedUnitIds(filteredUnits.map(u => u.id));
  };

  const selectAllSubmissions = () => {
    setSelectedSubmissionIds(pendingSubmissions.map(s => s.id));
  };

  const handleBulkUnlock = () => {
    if (selectedUnitIds.length === 0) return;
    onBulkUnlockUnits(selectedUnitIds);
    setActionComplete(`Unlocked ${selectedUnitIds.length} units`);
    setSelectedUnitIds([]);
    setTimeout(() => setActionComplete(null), 3000);
  };

  const handleBulkLock = () => {
    if (selectedUnitIds.length === 0) return;
    onBulkLockUnits(selectedUnitIds);
    setActionComplete(`Locked ${selectedUnitIds.length} units`);
    setSelectedUnitIds([]);
    setTimeout(() => setActionComplete(null), 3000);
  };

  const handleBulkGrade = () => {
    if (selectedSubmissionIds.length === 0 || !bulkGrade) return;
    onBulkGrade(selectedSubmissionIds, parseInt(bulkGrade), bulkComment);
    setActionComplete(`Graded ${selectedSubmissionIds.length} submissions`);
    setSelectedSubmissionIds([]);
    setBulkGrade('');
    setBulkComment('');
    setTimeout(() => setActionComplete(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {actionComplete && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-2 animate-in fade-in">
          <FaCircleCheck /> {actionComplete}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bulk Unlock */}
        <Card 
          className={`cursor-pointer transition-all ${activeAction === 'unlock' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => { setActiveAction('unlock'); setSelectedUnitIds([]); }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaLockOpen className="text-green-600 dark:text-green-400 text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Bulk Unlock</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Unlock multiple units at once</p>
            <div className="mt-3 text-xs text-slate-400">
              {units.filter(u => u.isLocked).length} locked units
            </div>
          </CardContent>
        </Card>

        {/* Bulk Lock */}
        <Card 
          className={`cursor-pointer transition-all ${activeAction === 'lock' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => { setActiveAction('lock'); setSelectedUnitIds([]); }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaLock className="text-red-600 dark:text-red-400 text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Bulk Lock</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lock multiple units at once</p>
            <div className="mt-3 text-xs text-slate-400">
              {units.filter(u => !u.isLocked).length} unlocked units
            </div>
          </CardContent>
        </Card>

        {/* Bulk Grade */}
        <Card 
          className={`cursor-pointer transition-all ${activeAction === 'grade' ? 'ring-2 ring-indigo-500' : ''}`}
          onClick={() => { setActiveAction('grade'); setSelectedSubmissionIds([]); }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaGraduationCap className="text-indigo-600 dark:text-indigo-400 text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Bulk Grade</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Grade multiple submissions</p>
            <div className="mt-3 text-xs text-slate-400">
              {pendingSubmissions.length} pending submissions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Panel */}
      {activeAction === 'unlock' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FaLockOpen className="text-green-500" /> Select Units to Unlock
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => selectAllUnits(true)}>
                Select All Locked
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {units.filter(u => u.isLocked).map(unit => (
                <button
                  key={unit.id}
                  onClick={() => toggleUnit(unit.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedUnitIds.includes(unit.id)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedUnitIds.includes(unit.id)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selectedUnitIds.includes(unit.id) && <FaCheck size={10} />}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{unit.title}</span>
                  </div>
                </button>
              ))}
            </div>
            {units.filter(u => u.isLocked).length === 0 && (
              <div className="text-center py-8 text-slate-400">No locked units</div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActiveAction(null)}>Cancel</Button>
              <Button onClick={handleBulkUnlock} disabled={selectedUnitIds.length === 0} className="bg-green-600 hover:bg-green-700">
                Unlock {selectedUnitIds.length} Units
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeAction === 'lock' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FaLock className="text-red-500" /> Select Units to Lock
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => selectAllUnits(false)}>
                Select All Unlocked
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {units.filter(u => !u.isLocked).map(unit => (
                <button
                  key={unit.id}
                  onClick={() => toggleUnit(unit.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedUnitIds.includes(unit.id)
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedUnitIds.includes(unit.id)
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selectedUnitIds.includes(unit.id) && <FaCheck size={10} />}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{unit.title}</span>
                  </div>
                </button>
              ))}
            </div>
            {units.filter(u => !u.isLocked).length === 0 && (
              <div className="text-center py-8 text-slate-400">No unlocked units</div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActiveAction(null)}>Cancel</Button>
              <Button onClick={handleBulkLock} disabled={selectedUnitIds.length === 0} className="bg-red-600 hover:bg-red-700">
                Lock {selectedUnitIds.length} Units
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeAction === 'grade' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FaGraduationCap className="text-indigo-500" /> Bulk Grade Submissions
              </CardTitle>
              <Button variant="outline" size="sm" onClick={selectAllSubmissions}>
                Select All Pending
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <FaTriangleExclamation className="text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                This will apply the same grade and comment to all selected submissions. Use carefully!
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {pendingSubmissions.map(sub => {
                const student = students.find(s => s.id === sub.studentId);
                const lesson = lessons.find(l => l.id === sub.lessonId);
                return (
                  <button
                    key={sub.id}
                    onClick={() => toggleSubmission(sub.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedSubmissionIds.includes(sub.id)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        selectedSubmissionIds.includes(sub.id)
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {selectedSubmissionIds.includes(sub.id) && <FaCheck size={10} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{student?.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{lesson?.title}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {pendingSubmissions.length === 0 && (
              <div className="text-center py-8 text-slate-400">No pending submissions</div>
            )}

            {selectedSubmissionIds.length > 0 && (
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Grade</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded p-2"
                    placeholder="0-100"
                    value={bulkGrade}
                    onChange={(e) => setBulkGrade(e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Comment</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded p-2"
                    placeholder="Feedback comment..."
                    value={bulkComment}
                    onChange={(e) => setBulkComment(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActiveAction(null)}>Cancel</Button>
              <Button onClick={handleBulkGrade} disabled={selectedSubmissionIds.length === 0 || !bulkGrade}>
                Grade {selectedSubmissionIds.length} Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkActions;

