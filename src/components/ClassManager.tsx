import React, { useState } from 'react';
import { Class } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaPlus, FaUsers, FaCopy, FaTrash, FaPenToSquare, FaChevronDown } from 'react-icons/fa6';

interface ClassManagerProps {
  classes: Class[];
  currentClassId: string | null;
  onSelectClass: (classId: string) => void;
  onCreateClass: (classData: Omit<Class, 'id' | 'createdAt' | 'classCode'>) => void;
  onUpdateClass: (classId: string, updates: Partial<Class>) => void;
  onDeleteClass: (classId: string) => void;
  onCopyClassCode: (classCode: string) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({
  classes,
  currentClassId,
  onSelectClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onCopyClassCode
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassPeriod, setNewClassPeriod] = useState('');
  const [newClassYear, setNewClassYear] = useState(new Date().getFullYear().toString());
  const [newClassEditorType, setNewClassEditorType] = useState<'p5' | 'scratch'>('p5');
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentClass = classes.find(c => c.id === currentClassId);

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    
    onCreateClass({
      name: newClassName,
      period: newClassPeriod || undefined,
      academicYear: newClassYear,
      teacherId: 'teacher1', // TODO: Get from auth
      defaultEditorType: newClassEditorType
    });
    
    setNewClassName('');
    setNewClassPeriod('');
    setNewClassEditorType('p5');
    setShowCreateForm(false);
  };

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setNewClassName(classItem.name);
    setNewClassPeriod(classItem.period || '');
    setNewClassYear(classItem.academicYear);
    setNewClassEditorType(classItem.defaultEditorType || 'p5');
    setShowCreateForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingClass) return;
    
    onUpdateClass(editingClass.id, {
      name: newClassName,
      period: newClassPeriod || undefined,
      academicYear: newClassYear,
      defaultEditorType: newClassEditorType
    });
    
    setEditingClass(null);
    setShowCreateForm(false);
    setNewClassName('');
    setNewClassEditorType('p5');
  };

  return (
    <div className="space-y-4">
      {/* Class Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FaUsers className="text-indigo-500" />
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {currentClass ? currentClass.name : 'Select a Class'}
              </div>
              {currentClass && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentClass.period && `${currentClass.period} • `}
                  {currentClass.academicYear}
                </div>
              )}
            </div>
          </div>
          <FaChevronDown className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => {
                    onSelectClass(classItem.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    currentClassId === classItem.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : ''
                  }`}
                >
                  <div className="font-medium text-slate-900 dark:text-white">{classItem.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {classItem.period && `${classItem.period} • `}
                    {classItem.academicYear}
                  </div>
                </button>
              ))}
              
              <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setShowDropdown(false);
                    setEditingClass(null);
                    setNewClassName('');
                    setNewClassPeriod('');
                  }}
                  className="w-full text-left px-4 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
                >
                  <FaPlus /> Create New Class
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Class Code Display */}
      {currentClass && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Class Code</div>
                <div className="text-2xl font-mono font-bold text-indigo-900 dark:text-indigo-100">
                  {currentClass.classCode}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Share this code with students to join
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(currentClass.classCode);
                  onCopyClassCode(currentClass.classCode);
                }}
              >
                <FaCopy className="mr-2" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Class Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClass ? 'Edit Class' : 'Create New Class'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                placeholder="e.g., Period 1, AP Computer Science"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Period (Optional)
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                  placeholder="e.g., Period 1"
                  value={newClassPeriod}
                  onChange={(e) => setNewClassPeriod(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                  placeholder="2024-2025"
                  value={newClassYear}
                  onChange={(e) => setNewClassYear(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Editor Type *
              </label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                value={newClassEditorType}
                onChange={(e) => setNewClassEditorType(e.target.value as 'p5' | 'scratch')}
              >
                <option value="p5">p5.js (Text Code)</option>
                <option value="scratch">Scratch (Visual Blocks)</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                AI will generate lessons using this editor by default
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingClass ? handleSaveEdit : handleCreateClass} disabled={!newClassName.trim()}>
                {editingClass ? 'Save Changes' : 'Create Class'}
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowCreateForm(false);
                setEditingClass(null);
                setNewClassName('');
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class List (for management) */}
      {classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{classItem.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {classItem.period && `${classItem.period} • `}
                      {classItem.academicYear} • Code: {classItem.classCode}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClass(classItem)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <FaPenToSquare />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${classItem.name}? This cannot be undone.`)) {
                          onDeleteClass(classItem.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
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

export default ClassManager;

