import React, { useState } from 'react';
import { FeedbackTemplate } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaPlus, FaPenToSquare, FaTrash, FaComments, FaStar, FaTriangleExclamation, FaCode, FaLightbulb } from 'react-icons/fa6';

interface FeedbackTemplatesProps {
  templates: FeedbackTemplate[];
  teacherId: string;
  onAddTemplate: (template: Omit<FeedbackTemplate, 'id' | 'createdAt'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<FeedbackTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
  onSelectTemplate?: (template: FeedbackTemplate) => void;
  selectionMode?: boolean;
}

const CATEGORIES = [
  { value: 'praise', label: 'Praise', icon: FaStar, color: 'text-yellow-500' },
  { value: 'syntax-error', label: 'Syntax Error', icon: FaCode, color: 'text-red-500' },
  { value: 'logic-error', label: 'Logic Error', icon: FaTriangleExclamation, color: 'text-orange-500' },
  { value: 'suggestion', label: 'Suggestion', icon: FaLightbulb, color: 'text-blue-500' },
  { value: 'general', label: 'General', icon: FaComments, color: 'text-slate-500' }
];

const DEFAULT_TEMPLATES: Omit<FeedbackTemplate, 'id' | 'createdAt' | 'createdBy'>[] = [
  { name: 'Great Work!', comment: 'Excellent job! Your code is clean and well-organized.', category: 'praise' },
  { name: 'Good Progress', comment: 'Good progress! Keep practicing and you\'ll master this concept.', category: 'praise' },
  { name: 'Missing Semicolon', comment: 'Check your code for missing semicolons. Remember, every statement needs one!', category: 'syntax-error' },
  { name: 'Typo in Function', comment: 'There\'s a typo in one of your function names. Double-check your spelling!', category: 'syntax-error' },
  { name: 'Logic Issue', comment: 'Your code runs but doesn\'t produce the expected result. Review your conditions and loops.', category: 'logic-error' },
  { name: 'Try Different Approach', comment: 'Consider breaking this problem into smaller steps. What needs to happen first?', category: 'suggestion' },
  { name: 'Add Comments', comment: 'Try adding comments to explain what each section of your code does.', category: 'suggestion' }
];

const FeedbackTemplates: React.FC<FeedbackTemplatesProps> = ({
  templates,
  teacherId,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onSelectTemplate,
  selectionMode = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FeedbackTemplate | null>(null);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !comment.trim()) return;

    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, {
        name: name.trim(),
        comment: comment.trim(),
        category
      });
    } else {
      onAddTemplate({
        name: name.trim(),
        comment: comment.trim(),
        category,
        createdBy: teacherId
      });
    }

    resetForm();
  };

  const handleEdit = (template: FeedbackTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setComment(template.comment);
    setCategory(template.category || 'general');
    setShowForm(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Delete this feedback template?')) {
      onDeleteTemplate(templateId);
    }
  };

  const resetForm = () => {
    setName('');
    setComment('');
    setCategory('general');
    setShowForm(false);
    setEditingTemplate(null);
  };

  const addDefaultTemplates = () => {
    DEFAULT_TEMPLATES.forEach(template => {
      onAddTemplate({
        ...template,
        createdBy: teacherId
      });
    });
  };

  const filteredTemplates = filterCategory
    ? templates.filter(t => t.category === filterCategory)
    : templates;

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.icon : FaComments;
  };

  const getCategoryColor = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.color : 'text-slate-500';
  };

  return (
    <div className="space-y-6">
      {!selectionMode && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback Templates</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Save time grading with reusable feedback
            </p>
          </div>
          <div className="flex gap-2">
            {templates.length === 0 && (
              <Button variant="outline" onClick={addDefaultTemplates}>
                Add Default Templates
              </Button>
            )}
            <Button onClick={() => { setShowForm(true); setEditingTemplate(null); }}>
              <FaPlus className="mr-2" /> New Template
            </Button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterCategory === null
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All ({templates.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = templates.filter(t => t.category === cat.value).length;
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                filterCategory === cat.value
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={cat.color} /> {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                placeholder="e.g., Great Work!"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Feedback Comment *
              </label>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                rows={3}
                placeholder="Write your feedback template..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!name.trim() || !comment.trim()}>
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const Icon = getCategoryIcon(template.category || 'general');
          return (
            <Card 
              key={template.id}
              className={`${selectionMode ? 'cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all' : ''}`}
              onClick={() => selectionMode && onSelectTemplate?.(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={getCategoryColor(template.category || 'general')} />
                    <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
                  </div>
                  {!selectionMode && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <FaPenToSquare size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {template.comment}
                </p>
                {selectionMode && (
                  <div className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Click to use this template
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <FaComments className="mx-auto text-4xl mb-2 opacity-50" />
            <p>No templates yet. Create one to save time when grading!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackTemplates;

