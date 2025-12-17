import React, { useState } from 'react';
import { Rubric, RubricCriterion, LessonPlan } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaPlus, FaPenToSquare, FaTrash, FaClipboardList, FaCopy, FaLink } from 'react-icons/fa6';

interface RubricsManagerProps {
  rubrics: Rubric[];
  lessons: LessonPlan[];
  onAddRubric: (rubric: Omit<Rubric, 'id' | 'createdAt'>) => void;
  onUpdateRubric: (rubricId: string, updates: Partial<Rubric>) => void;
  onDeleteRubric: (rubricId: string) => void;
  onAttachRubricToLesson: (rubricId: string, lessonId: string) => void;
}

const RubricsManager: React.FC<RubricsManagerProps> = ({
  rubrics,
  lessons,
  onAddRubric,
  onUpdateRubric,
  onDeleteRubric,
  onAttachRubricToLesson
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [attachingRubricId, setAttachingRubricId] = useState<string | null>(null);

  const handleAddCriterion = () => {
    setCriteria(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      description: '',
      maxPoints: 25
    }]);
  };

  const handleUpdateCriterion = (criterionId: string, updates: Partial<RubricCriterion>) => {
    setCriteria(prev => prev.map(c => c.id === criterionId ? { ...c, ...updates } : c));
  };

  const handleRemoveCriterion = (criterionId: string) => {
    setCriteria(prev => prev.filter(c => c.id !== criterionId));
  };

  const handleSubmit = () => {
    if (!name.trim() || criteria.length === 0) return;

    if (editingRubric) {
      onUpdateRubric(editingRubric.id, {
        name: name.trim(),
        description: description.trim(),
        criteria
      });
    } else {
      onAddRubric({
        name: name.trim(),
        description: description.trim(),
        criteria
      });
    }

    resetForm();
  };

  const handleEdit = (rubric: Rubric) => {
    setEditingRubric(rubric);
    setName(rubric.name);
    setDescription(rubric.description || '');
    setCriteria([...rubric.criteria]);
    setShowForm(true);
  };

  const handleDuplicate = (rubric: Rubric) => {
    onAddRubric({
      name: `${rubric.name} (Copy)`,
      description: rubric.description,
      criteria: rubric.criteria.map(c => ({ ...c, id: Date.now().toString() + Math.random() }))
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCriteria([]);
    setShowForm(false);
    setEditingRubric(null);
  };

  const getTotalPoints = (criteriaList: RubricCriterion[]) => {
    return criteriaList.reduce((sum, c) => sum + c.maxPoints, 0);
  };

  // Default rubric templates
  const createDefaultRubric = () => {
    setName('Standard Code Review');
    setDescription('General rubric for code assignments');
    setCriteria([
      { id: '1', name: 'Code Correctness', description: 'Code runs without errors and produces expected output', maxPoints: 40 },
      { id: '2', name: 'Code Quality', description: 'Clean, readable code with good variable names', maxPoints: 25 },
      { id: '3', name: 'Following Instructions', description: 'All requirements met', maxPoints: 25 },
      { id: '4', name: 'Creativity', description: 'Goes beyond minimum requirements', maxPoints: 10 }
    ]);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rubrics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create grading rubrics for consistent evaluation
          </p>
        </div>
        <div className="flex gap-2">
          {rubrics.length === 0 && (
            <Button variant="outline" onClick={createDefaultRubric}>
              Use Template
            </Button>
          )}
          <Button onClick={() => { setShowForm(true); setEditingRubric(null); resetForm(); handleAddCriterion(); }}>
            <FaPlus className="mr-2" /> Create Rubric
          </Button>
        </div>
      </div>

      {/* Attach Rubric Modal */}
      {attachingRubricId && (
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle>Attach Rubric to Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Select a lesson to attach this rubric to:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {lessons.filter(l => l.type === 'Assignment').map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onAttachRubricToLesson(attachingRubricId, lesson.id);
                    setAttachingRubricId(null);
                  }}
                  className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                >
                  <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{lesson.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lesson.difficulty}</div>
                </button>
              ))}
            </div>
            {lessons.filter(l => l.type === 'Assignment').length === 0 && (
              <div className="text-center py-4 text-slate-400">No assignments available</div>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setAttachingRubricId(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRubric ? 'Edit Rubric' : 'Create Rubric'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rubric Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                  placeholder="e.g., Code Review Rubric"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Criteria * ({criteria.length} items, {getTotalPoints(criteria)} points total)
                </label>
                <Button variant="outline" size="sm" onClick={handleAddCriterion}>
                  <FaPlus className="mr-1" /> Add Criterion
                </Button>
              </div>
              <div className="space-y-3">
                {criteria.map((criterion, idx) => (
                  <div key={criterion.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Criterion {idx + 1}</span>
                      <button
                        onClick={() => handleRemoveCriterion(criterion.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-1">
                        <input
                          type="text"
                          className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1 text-sm"
                          placeholder="Name"
                          value={criterion.name}
                          onChange={(e) => handleUpdateCriterion(criterion.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1 text-sm"
                          placeholder="Description"
                          value={criterion.description}
                          onChange={(e) => handleUpdateCriterion(criterion.id, { description: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-2 py-1 text-sm"
                            value={criterion.maxPoints}
                            onChange={(e) => handleUpdateCriterion(criterion.id, { maxPoints: parseInt(e.target.value) || 0 })}
                          />
                          <span className="text-xs text-slate-400">pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!name.trim() || criteria.length === 0}>
                {editingRubric ? 'Update' : 'Create'} Rubric
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rubrics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rubrics.map(rubric => (
          <Card key={rubric.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rubric.name}</CardTitle>
                  {rubric.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{rubric.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(rubric)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <FaPenToSquare size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(rubric)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <FaCopy size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this rubric?')) onDeleteRubric(rubric.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {rubric.criteria.map((criterion, idx) => (
                  <div key={criterion.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{criterion.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{criterion.maxPoints} pts</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{getTotalPoints(rubric.criteria)} pts</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setAttachingRubricId(rubric.id)}
              >
                <FaLink className="mr-2" /> Attach to Lesson
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {rubrics.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <FaClipboardList className="mx-auto text-4xl mb-2 opacity-50" />
            <p>No rubrics yet. Create one to standardize your grading!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RubricsManager;

