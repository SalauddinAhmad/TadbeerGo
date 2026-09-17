export type ActivityType =
  | 'CLASS'
  | 'JUMUAH'
  | 'KHUTBAH'
  | 'LECTURE'
  | 'PROGRAMME'
  | 'MEETING'
  | 'TRAVEL'
  | 'PERSONAL'
  | 'TASK'
  | 'PREPARATION'
  | 'OTHER';

export type ActivityStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MISSED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone?: string;
  role_name: 'owner' | 'ps_admin';
  role_display_name: string;
  permissions?: string[];
  avatar?: string;
}

export interface Activity {
  id: number;
  user_id: number;
  type: ActivityType;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  topic?: string;
  notes?: string;
  status: ActivityStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  preparation_required: boolean | number;
  travel_required: boolean | number;
  is_private: boolean | number;
  source?: string;
  contact_name?: string;
  organization_name?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  teacher_name: string;
  target_group?: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  meeting_link?: string;
  start_date: string;
  end_date?: string;
  recurrence_rule?: {
    days?: string[];
    start_time?: string;
    duration_minutes?: number;
  };
  default_duration_minutes: number;
  syllabus?: string;
  progress_unit: string;
  current_progress?: string;
  total_units?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
  total_sessions?: number;
  completed_sessions?: number;
  missed_sessions?: number;
  sessions?: ClassSession[];
}

export interface ClassSession {
  id: number;
  course_id: number;
  course_title?: string;
  activity_id?: number;
  session_no: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED' | 'CANCELLED';
  topic?: string;
  lesson_title?: string;
  covered_content?: string;
  progress_value?: string;
  next_starting_point?: string;
  homework?: string;
  teacher_notes?: string;
  student_notes?: string;
  miss_reason?: string;
  miss_notes?: string;
  rescheduled_to_session_id?: number;
}

export interface JumuaEvent {
  id: number | null;
  date: string;
  friday_number?: number;
  mosque_id: number | null;
  mosque_name: string | null;
  mosque_address?: string | null;
  mosque_maps_url?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  status: 'FREE' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  khutbah_topic?: string | null;
  notes?: string | null;
  preparation_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'READY';
}

export interface Mosque {
  id: number;
  name: string;
  address?: string;
  district?: string;
  maps_url?: string;
  contact_person?: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
}

export interface Programme {
  id: number;
  title: string;
  programme_type: string;
  date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  location?: string;
  maps_url?: string;
  organizer_id?: number;
  organizer_name?: string;
  contact_person?: string;
  phone?: string;
  whatsapp?: string;
  topic?: string;
  audience_type?: string;
  description?: string;
  notes?: string;
  status: 'DRAFT' | 'INVITED' | 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
  preparation_required: boolean | number;
  travel_required: boolean | number;
  total_prep_tasks?: number;
  completed_prep_tasks?: number;
  preparations?: {
    id: number;
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    due_date?: string;
  }[];
}

export interface Contact {
  id: number;
  organization_id?: number;
  organization_name?: string;
  name: string;
  designation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  is_important: boolean | number;
}

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  type: string;
  status: 'UNREAD' | 'READ';
  created_at: string;
}

export interface DashboardData {
  now: Activity | null;
  next: Activity | null;
  today_timeline: Activity[];
  upcoming: Activity[];
  needs_attention: {
    type: string;
    title: string;
    subtitle: string;
    action_url: string;
    severity: 'warning' | 'info';
    item_id?: number;
  }[];
  conflicts: {
    id1: number;
    title1: string;
    date: string;
    start1: string;
    end1: string;
    id2: number;
    title2: string;
    start2: string;
    end2: string;
  }[];
  upcoming_jumua: JumuaEvent;
  stats: {
    active_courses: number;
    pending_programmes: number;
    today_activities_count: number;
    unread_notifications: number;
  };
  meta: {
    current_time: string;
    today_date: string;
    is_owner: boolean;
  };
}
