import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { FaPlus, FaPenToSquare, FaTrash, FaBullhorn, FaCalendarDays, FaUsers } from 'react-icons/fa6';
import { supabaseService } from '../services/supabaseService';

interface AnnouncementsManagerProps {
  classId: string;
  teacherId: string;
  announcements: Announcement[];
  students: { id: string; name: string }[];
  onAnnouncementUpdate: (announcement: Announcement) => void;
  onAnnouncementDelete: (announcementId: string) => void;
}

const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({
  classId,
  teacherId,
  announcements,
  students,
  onAnnouncementUpdate,
  onAnnouncementDelete
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title);
      setContent(editingAnnouncement.content);
      setScheduledDate(editingAnnouncement.scheduledAt 
        ? new Date(editingAnnouncement.scheduledAt).toISOString().slice(0, 16)
        : '');
      setTargetStudentIds(editingAnnouncement.targetStudentIds || []);
      setSelectAll(!editingAnnouncement.targetStudentIds || editingAnnouncement.targetStudentIds.length === 0);
    }
  }, [editingAnnouncement]);

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setTargetStudentIds([]);
    } else {
      setTargetStudentIds(students.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleToggleStudent = (studentId: string) => {
    if (targetStudentIds.includes(studentId)) {
      setTargetStudentIds(prev => prev.filter(id => id !== studentId));
      setSelectAll(false);
    } else {
      setTargetStudentIds(prev => [...prev, studentId]);
      if (targetStudentIds.length + 1 === students.length) {
        setSelectAll(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    const announcementData = {
      classId,
      title: title.trim(),
      content: content.trim(),
      scheduledAt: scheduledDate ? new Date(scheduledDate).getTime() : undefined,
      createdBy: teacherId,
      targetStudentIds: selectAll || targetStudentIds.length === 0 ? undefined : targetStudentIds
    };

    if (editingAnnouncement) {
      const updated = await supabaseService.createAnnouncement({
        ...announcementData,
        id: editingAnnouncement.id,
        createdAt: editingAnnouncement.createdAt
      } as any);
      onAnnouncementUpdate(updated);
    } else {
      const newAnnouncement = await supabaseService.createAnnouncement(announcementData);
      onAnnouncementUpdate(newAnnouncement);
    }

    // Reset form
    setTitle('');
    setContent('');
    setScheduledDate('');
    setTargetStudentIds([]);
    setSelectAll(true);
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleDelete = async (announcementId: string) => {
    if (confirm('Delete this announcement?')) {
      onAnnouncementDelete(announcementId);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const aTime = a.scheduledAt || a.createdAt;
    const bTime = b.scheduledAt || b.createdAt;
    return bTime - aTime;
  });

  const now = Date.now();

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {showForm ? (
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-4">
           <div className="h-2 bg-gradient-to-r from-sky-400 to-primary-600"></div>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Content *
              </label>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={4}
                placeholder="Write your announcement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 text-sm"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Leave empty to post immediately
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Target Audience
                  </label>
                  <div className="border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md p-3 max-h-48 overflow-y-auto">
                    <button
                      onClick={handleToggleSelectAll}
                      className="mb-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                    >
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </button>
                    <div className="space-y-1">
                      {students.map(student => (
                        <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectAll || targetStudentIds.includes(student.id)}
                            onChange={() => handleToggleStudent(student.id)}
                            disabled={selectAll}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{student.name}</span>
                        </label>
                      ))}
                    </div>
                    {selectAll && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic border-t pt-2 border-slate-100 dark:border-slate-600">
                        All students will see this announcement
                      </p>
                    )}
                  </div>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()} className="flex-1">
                {editingAnnouncement ? 'Update' : 'Post'} Announcement
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowForm(false);
                setEditingAnnouncement(null);
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Announcements</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage class communication</p>
              </div>
               <Button onClick={() => {
                  setShowForm(true);
                  setEditingAnnouncement(null);
                  setTitle('');
                  setContent('');
                  setScheduledDate('');
                  setTargetStudentIds([]);
                  setSelectAll(true);
                }} className="shadow-lg shadow-indigo-500/20">
                  <FaPlus className="mr-2" /> New Announcement
                </Button>
          </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FaBullhorn className="mx-auto text-4xl mb-3 opacity-50" />
            <p>No announcements yet.</p>
            <p className="text-sm mt-1">Create one to get started!</p>
          </div>
        ) : (
          sortedAnnouncements.map((announcement) => {
            const isScheduled = announcement.scheduledAt && announcement.scheduledAt > now;
            const isPast = announcement.scheduledAt && announcement.scheduledAt < now;
            
            return (
              <Card key={announcement.id} className={`border-none shadow-md overflow-hidden transition-all hover:shadow-lg ${isScheduled ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-white dark:bg-slate-900'}`}>
                 {isScheduled ? (
                     <div className="h-1 bg-amber-400"></div>
                 ) : (
                     <div className="h-1 bg-indigo-500"></div>
                 )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {isScheduled && (
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <FaCalendarDays /> Scheduled
                          </span>
                        )}
                        {announcement.targetStudentIds && announcement.targetStudentIds.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <FaUsers /> {announcement.targetStudentIds.length} recipient{announcement.targetStudentIds.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        {isScheduled 
                          ? <span>Scheduled for <span className="font-bold">{new Date(announcement.scheduledAt!).toLocaleString()}</span></span>
                          : <span>Posted <span className="font-bold">{new Date(announcement.createdAt).toLocaleString()}</span></span>
                        }
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Edit"
                      >
                        <FaPenToSquare />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    {announcement.content}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;