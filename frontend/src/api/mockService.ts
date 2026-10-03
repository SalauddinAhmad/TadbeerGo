import {
  initialMockMosques,
  initialMockFridays,
  initialMockCourses,
  initialMockProgrammes,
  initialMockActivities,
  initialMockContacts
} from './mockData';
import { getLocalDateString } from '../utils/bengali';

// Local storage keys for persistent offline demo state
const STORAGE_PREFIX = 'tadbeer_demo_';

function getStoredOrInitial<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore storage parse error
  }
  return initial;
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage write error
  }
}

// In-memory / localStorage state holders
let mockMosques = getStoredOrInitial('mosques', initialMockMosques);
let mockFridays = getStoredOrInitial('fridays', initialMockFridays);
let mockCourses = getStoredOrInitial('courses', initialMockCourses);
let mockProgrammes = getStoredOrInitial('programmes', initialMockProgrammes);
let mockActivities = getStoredOrInitial('activities', initialMockActivities);
let mockContacts = getStoredOrInitial('contacts', initialMockContacts);

const defaultMockUser = {
  id: 1,
  role_id: 1,
  name: 'শায়খ মোখতার আহমাদ',
  email: 'admin@mokhterahmad.com',
  phone: '+8801700000000',
  role_name: 'owner' as const,
  role_display_name: 'Scholar / Owner',
  avatar: '/shaikh-portrait.jpg'
};

export function handleMockApiRequest(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const cleanUrl = endpoint.split('?')[0];
  const queryParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
  const body = options.body ? JSON.parse(options.body as string) : {};

  const todayStr = getLocalDateString(new Date());

  // 1. AUTH
  if (cleanUrl === '/auth/me' || cleanUrl === '/auth/user') {
    const storedUser = localStorage.getItem('tadbeer_demo_user');
    return { user: storedUser ? JSON.parse(storedUser) : defaultMockUser };
  }

  if (cleanUrl === '/auth/login') {
    const email = body.email || 'admin@mokhterahmad.com';
    const isPs = email.includes('ps');
    const user = {
      id: isPs ? 2 : 1,
      role_id: isPs ? 2 : 1,
      name: isPs ? 'পার্সোনাল সেক্রেটারি' : 'শায়খ মোখতার আহমাদ',
      email: email,
      role_name: isPs ? 'ps_admin' : 'owner',
      role_display_name: isPs ? 'PS / Admin' : 'Scholar / Owner',
      avatar: '/shaikh-portrait.jpg'
    };
    localStorage.setItem('tadbeer_demo_user', JSON.stringify(user));
    return { user };
  }

  if (cleanUrl === '/auth/logout') {
    localStorage.removeItem('tadbeer_demo_user');
    return { success: true };
  }

  // 2. DASHBOARD
  if (cleanUrl === '/dashboard') {
    const todayList = mockActivities.filter(a => a.date === todayStr);
    const upcomingList = mockActivities.filter(a => a.date > todayStr);

    const upcomingJumua = mockFridays.find(f => f.date >= todayStr && f.status !== 'CANCELLED') || mockFridays[1];

    return {
      now: null,
      next: todayList.length > 0 ? todayList[0] : upcomingList[0] || null,
      today_timeline: todayList.length > 0 ? todayList : mockActivities.slice(0, 3),
      upcoming: upcomingList.length > 0 ? upcomingList : mockActivities.slice(3),
      stats: {
        total_classes: 24,
        total_programmes: 18,
        upcoming_jumua_count: mockFridays.length,
        active_courses: mockCourses.length
      },
      upcoming_jumua: upcomingJumua,
      needs_attention: []
    };
  }

  // 3. ACTIVITIES
  if (cleanUrl === '/activities') {
    if (method === 'GET') {
      return { activities: mockActivities };
    }
    if (method === 'POST') {
      const newAct = {
        id: Date.now(),
        user_id: 1,
        status: 'CONFIRMED',
        priority: 'HIGH',
        preparation_required: false,
        travel_required: false,
        is_private: false,
        ...body
      };
      mockActivities = [newAct, ...mockActivities];
      setStored('activities', mockActivities);
      return { id: newAct.id, activity: newAct, success: true };
    }
  }

  if (cleanUrl.startsWith('/activities/check-conflict')) {
    return { has_conflict: false, conflicts: [] };
  }

  if (cleanUrl.startsWith('/activities/')) {
    const actId = parseInt(cleanUrl.split('/activities/')[1], 10);
    if (method === 'PUT') {
      mockActivities = mockActivities.map(a => a.id === actId ? { ...a, ...body } : a);
      setStored('activities', mockActivities);
      return { success: true };
    }
    if (method === 'DELETE') {
      mockActivities = mockActivities.filter(a => a.id !== actId);
      setStored('activities', mockActivities);
      return { success: true };
    }
  }

  // 4. JUMUAH
  if (cleanUrl === '/jumua/monthly') {
    return { fridays: mockFridays };
  }

  if (cleanUrl === '/jumua/assign' || cleanUrl.startsWith('/jumua/')) {
    if (method === 'POST' || method === 'PUT') {
      const eventId = body.id || parseInt(cleanUrl.split('/jumua/')[1] || '0', 10);
      mockFridays = mockFridays.map(f => {
        if (f.id === eventId || (body.date && f.date === body.date)) {
          return { ...f, ...body };
        }
        return f;
      });
      setStored('fridays', mockFridays);
      return { success: true };
    }
  }

  // 5. MOSQUES
  if (cleanUrl === '/mosques') {
    if (method === 'GET') {
      return { mosques: mockMosques };
    }
    if (method === 'POST') {
      const newMosque = { id: Date.now(), ...body };
      mockMosques = [...mockMosques, newMosque];
      setStored('mosques', mockMosques);
      return { id: newMosque.id, mosque: newMosque, success: true };
    }
  }

  // 6. COURSES
  if (cleanUrl === '/courses') {
    if (method === 'GET') {
      return { courses: mockCourses };
    }
    if (method === 'POST') {
      const newCourse = {
        id: Date.now(),
        status: 'ACTIVE',
        teacher_name: 'শায়খ মোখতার আহমাদ',
        total_sessions: 24,
        completed_sessions: 0,
        missed_sessions: 0,
        sessions: [],
        ...body
      };
      mockCourses = [newCourse, ...mockCourses];
      setStored('courses', mockCourses);
      return { id: newCourse.id, course: newCourse, success: true };
    }
  }

  if (cleanUrl.startsWith('/courses/')) {
    const parts = cleanUrl.split('/');
    const courseId = parseInt(parts[2], 10);
    const subAction = parts[3];

    if (!subAction) {
      if (method === 'GET') {
        const found = mockCourses.find(c => c.id === courseId) || mockCourses[0];
        return { course: found };
      }
      if (method === 'PUT') {
        mockCourses = mockCourses.map(c => c.id === courseId ? { ...c, ...body } : c);
        setStored('courses', mockCourses);
        return { success: true };
      }
      if (method === 'DELETE') {
        mockCourses = mockCourses.filter(c => c.id !== courseId);
        setStored('courses', mockCourses);
        return { success: true };
      }
    }

    if (subAction === 'sessions' && method === 'POST') {
      const newSession = { id: Date.now(), course_id: courseId, status: 'PENDING', ...body };
      mockCourses = mockCourses.map(c => {
        if (c.id === courseId) {
          return { ...c, sessions: [...(c.sessions || []), newSession] };
        }
        return c;
      });
      setStored('courses', mockCourses);
      return { id: newSession.id, session: newSession, success: true };
    }

    if (subAction === 'generate-sessions') {
      return { success: true, count: 8 };
    }
  }

  if (cleanUrl.startsWith('/class-sessions/')) {
    return { success: true };
  }

  // 7. PROGRAMMES
  if (cleanUrl === '/programmes') {
    if (method === 'GET') {
      return { programmes: mockProgrammes };
    }
    if (method === 'POST') {
      const newProg = {
        id: Date.now(),
        status: 'CONFIRMED',
        total_prep_tasks: 2,
        completed_prep_tasks: 0,
        ...body
      };
      mockProgrammes = [newProg, ...mockProgrammes];
      setStored('programmes', mockProgrammes);
      return { id: newProg.id, programme: newProg, success: true };
    }
  }

  if (cleanUrl.startsWith('/programmes/')) {
    const progId = parseInt(cleanUrl.split('/programmes/')[1], 10);
    if (method === 'PUT') {
      mockProgrammes = mockProgrammes.map(p => p.id === progId ? { ...p, ...body } : p);
      setStored('programmes', mockProgrammes);
      return { success: true };
    }
    if (method === 'DELETE') {
      mockProgrammes = mockProgrammes.filter(p => p.id !== progId);
      setStored('programmes', mockProgrammes);
      return { success: true };
    }
  }

  // 8. CONTACTS
  if (cleanUrl === '/contacts') {
    return { contacts: mockContacts };
  }

  // 9. USERS & SETTINGS
  if (cleanUrl === '/users') {
    return {
      users: [
        defaultMockUser,
        {
          id: 2,
          role_id: 2,
          name: 'পার্সোনাল সেক্রেটারি',
          email: 'ps@mokhterahmad.com',
          phone: '+8801800000000',
          role_name: 'ps_admin' as const,
          role_display_name: 'Personal Secretary (PS)',
          avatar: '/shaikh-portrait.jpg'
        }
      ],
      roles: [
        { id: 1, name: 'owner', display_name: 'Scholar / Owner' },
        { id: 2, name: 'ps_admin', display_name: 'Personal Secretary (PS)' }
      ]
    };
  }

  // Default catch-all mock response
  return { success: true, message: 'Operated in Standalone Demo Mode' };
}
