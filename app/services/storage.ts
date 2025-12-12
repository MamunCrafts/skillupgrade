import { Course, ExamResult, User } from '../types';

const KEYS = {
  USERS: 'quiz_app_users',
  COURSES: 'quiz_app_courses',
  RESULTS: 'quiz_app_results',
  CURRENT_USER: 'quiz_app_current_user',
};

export const storage = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User) => {
    const users = storage.getUsers();
    // Check if user exists, if so update, else add
    const existingIndex = users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getCourses: (): Course[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.COURSES);
    return data ? JSON.parse(data) : [];
  },

  saveCourse: (course: Course) => {
    const courses = storage.getCourses();
    const existingIndex = courses.findIndex((c) => c.id === course.id);
    if (existingIndex >= 0) {
      courses[existingIndex] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  },

  deleteCourse: (courseId: string) => {
    const courses = storage.getCourses().filter((c) => c.id !== courseId);
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  },

  getResults: (): ExamResult[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.RESULTS);
    return data ? JSON.parse(data) : [];
  },

  saveResult: (result: ExamResult) => {
    const results = storage.getResults();
    results.push(result);
    localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  
  // Initialize some seed data if empty (Optional, but good for testing)
  initialize: () => {
      // Logic to seed if needed, leaving empty for now as requested
  }
};
