import React, { useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { FaSchool, FaArrowRight } from 'react-icons/fa6';
import { Student } from '../types';

interface JoinClassProps {
  student: Student;
  onClassJoined: (classId: string) => void;
}

const JoinClass: React.FC<JoinClassProps> = ({ student, onClassJoined }) => {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (classCode.length !== 6) {
      setError('Class code must be 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find class by code
      // We need to add this method to supabaseService or expose it
      // For now, we'll try to join and handle errors
      const classId = await supabaseService.joinClassByCode(student.id, classCode);
      onClassJoined(classId);
    } catch (err: any) {
      setError(err.message || 'Failed to join class. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FaSchool className="text-3xl" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Join Your Class
          </CardTitle>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-2">
            Enter the 6-digit class code provided by your teacher
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="flex justify-center">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-48 text-center text-3xl tracking-widest py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
              disabled={loading || classCode.length !== 6}
            >
              {loading ? 'Joining...' : (
                <span className="flex items-center justify-center gap-2">
                  Join Class <FaArrowRight />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinClass;

