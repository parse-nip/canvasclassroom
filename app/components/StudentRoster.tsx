import React, { useState, useRef } from 'react';
import { Student } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaPlus, FaUpload, FaPenToSquare, FaTrash, FaUser, FaFileCsv } from 'react-icons/fa6';

interface StudentRosterProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'avatar'>) => void;
  onUpdateStudent: (studentId: string, updates: Partial<Student>) => void;
  onRemoveStudent: (studentId: string) => void;
  onImportCSV: (csvData: string) => void;
}

const StudentRoster: React.FC<StudentRosterProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onRemoveStudent,
  onImportCSV
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentNotes, setNewStudentNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    
    onAddStudent({
      name: newStudentName,
      email: newStudentEmail || undefined,
      studentId: newStudentId || undefined,
      notes: newStudentNotes || undefined,
      isActive: true
    });
    
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentId('');
    setNewStudentNotes('');
    setShowAddForm(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setNewStudentName(student.name);
    setNewStudentEmail(student.email || '');
    setNewStudentId(student.studentId || '');
    setNewStudentNotes(student.notes || '');
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingStudent) return;
    
    onUpdateStudent(editingStudent.id, {
      name: newStudentName,
      email: newStudentEmail || undefined,
      studentId: newStudentId || undefined,
      notes: newStudentNotes || undefined
    });
    
    setEditingStudent(null);
    setShowAddForm(false);
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentId('');
    setNewStudentNotes('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      onImportCSV(csvData);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeStudents = students.filter(s => s.isActive);
  const inactiveStudents = students.filter(s => !s.isActive);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center hidden">
         {/* Header handled by TeacherDashboard now */}
      </div>

      {/* CSV Import Help */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 shadow-sm overflow-hidden">
        <div className="h-1 bg-blue-400"></div>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FaFileCsv className="text-blue-600 dark:text-blue-400 mt-1" />
            <div className="flex-1">
              <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">CSV Import Format</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                Your CSV should have headers: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">name</code>, 
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded mx-1">email</code> (optional), 
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded mx-1">studentId</code> (optional)
              </div>
            </div>
             <div className="flex gap-2">
               <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
              >
                <FaUpload className="mr-2" /> Import CSV
              </Button>
              <Button size="sm" onClick={() => {
                setShowAddForm(true);
                setEditingStudent(null);
                setNewStudentName('');
                setNewStudentEmail('');
                setNewStudentId('');
                setNewStudentNotes('');
              }}>
                <FaPlus className="mr-2" /> Add Student
              </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-4">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Student Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                  placeholder="student@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student ID (Optional)
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                  placeholder="12345"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2"
                rows={2}
                placeholder="Additional notes about this student..."
                value={newStudentNotes}
                onChange={(e) => setNewStudentNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={editingStudent ? handleSaveEdit : handleAddStudent} disabled={!newStudentName.trim()}>
                {editingStudent ? 'Save Changes' : 'Add Student'}
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowAddForm(false);
                setEditingStudent(null);
                setNewStudentName('');
                setNewStudentEmail('');
                setNewStudentId('');
                setNewStudentNotes('');
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student List */}
      <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
         <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-row justify-between items-center">
          <CardTitle>Active Students <span className="ml-2 text-sm font-normal text-slate-500">{activeStudents.length} students</span></CardTitle>
          
        </CardHeader>
        <CardContent className="p-0">
          {activeStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FaUser className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No students yet. Add students manually or import from CSV.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border-2 border-indigo-50 dark:border-indigo-800">
                      {student.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        {student.email && <span>{student.email}</span>}
                        {student.studentId && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded">ID: {student.studentId}</span>}
                        {student.notes && <span className="italic text-slate-400 max-w-[200px] truncate">• {student.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      title="Edit Student"
                    >
                      <FaPenToSquare />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${student.name} from roster?`)) {
                          onRemoveStudent(student.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Archive Student"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Students */}
      {inactiveStudents.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-80">
          <CardHeader className="py-3 px-4 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-sm text-slate-500">Archived Students ({inactiveStudents.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {inactiveStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3 grayscale opacity-60">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {student.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-slate-600 dark:text-slate-400 text-sm">{student.name}</div>
                    </div>
                  </div>
                  <button
                      onClick={() => onUpdateStudent(student.id, { isActive: true })}
                      className="text-xs text-indigo-600 hover:underline"
                  >
                      Restore
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentRoster;