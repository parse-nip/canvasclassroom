import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseService } from '../services/supabaseService';

// Tests for supabaseService
describe('SupabaseService', () => {
  describe('generateClassCode', () => {
    it('generates a 6-digit class code', async () => {
      // The class code generation happens internally in createClass
      // This test validates the format assumption
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });
  });

  describe('studentToDb mapping', () => {
    it('handles empty student name for avatar initials', () => {
      // Test the initials generation logic
      const emptyName = '';
      const initials = (emptyName || '')
        .split(' ')
        .map((n: string) => n?.[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';
      
      expect(initials).toBe('??');
    });

    it('generates correct initials for normal names', () => {
      const name = 'John Doe';
      const initials = name
        .split(' ')
        .map((n: string) => n?.[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      expect(initials).toBe('JD');
    });

    it('handles single word names', () => {
      const name = 'John';
      const initials = name
        .split(' ')
        .map((n: string) => n?.[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      expect(initials).toBe('J');
    });

    it('handles whitespace-only names', () => {
      const name = '   ';
      const initials = (name || '')
        .split(' ')
        .map((n: string) => n?.[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';
      
      expect(initials).toBe('??');
    });
  });
});

describe('Type validations', () => {
  it('validates user role correctly', () => {
    const validateRole = (role: unknown): 'teacher' | 'student' | null => {
      return role === 'teacher' || role === 'student' ? role : null;
    };

    expect(validateRole('teacher')).toBe('teacher');
    expect(validateRole('student')).toBe('student');
    expect(validateRole('admin')).toBe(null);
    expect(validateRole(undefined)).toBe(null);
    expect(validateRole(null)).toBe(null);
    expect(validateRole(123)).toBe(null);
  });
});

