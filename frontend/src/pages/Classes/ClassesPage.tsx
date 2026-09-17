import React, { useEffect, useState } from 'react';
import {
  Clock,
  Plus,
  X,
  CheckCircle2,
  RotateCw,
  ExternalLink,
  Users,
  Video,
  Layers,
  Filter,
  Edit3,
  Trash2,
  Calendar,
  BookOpen,
  AlertCircle,
  Check
} from 'lucide-react';
import {
  QuranRehalIcon,
  CrescentStarIcon,
  RubElHizbIcon
} from '../../components/icons/IslamicIcons';
import { Course, ClassSession } from '../../types';
import { api } from '../../api/client';
import { toBengaliDigits } from '../../utils/bengali';

export const ClassesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<ClassSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<ClassSession | null>(null);

  const [progressModalSession, setProgressModalSession] = useState<ClassSession | null>(null);
  const [missedModalSession, setMissedModalSession] = useState<ClassSession | null>(null);
  const [rescheduleModalSession, setRescheduleModalSession] = useState<ClassSession | null>(null);

  // Add / Edit Course form states
  const [courseFormTitle, setCourseFormTitle] = useState('');
  const [courseFormDescription, setCourseFormDescription] = useState('');
  const [courseFormTeacher, setCourseFormTeacher] = useState('শায়খ মোখতার আহমাদ');
  const [courseFormTargetGroup, setCourseFormTargetGroup] = useState('উচ্চতর শিক্ষার্থী ব্যাচ');
  const [courseFormMode, setCourseFormMode] = useState<'ONLINE' | 'OFFLINE' | 'HYBRID'>('ONLINE');
  const [courseFormMeetingLink, setCourseFormMeetingLink] = useState('');
  const [courseFormStartTime, setCourseFormStartTime] = useState('21:00');
  const [courseFormDuration, setCourseFormDuration] = useState(60);
  const [courseFormRecurrenceDays, setCourseFormRecurrenceDays] = useState<string[]>(['MON', 'WED']);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // Add / Edit Class Session form states
  const [sessFormNo, setSessFormNo] = useState<number>(1);
  const [sessFormDate, setSessFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessFormStartTime, setSessFormStartTime] = useState<string>('21:00');
  const [sessFormEndTime, setSessFormEndTime] = useState<string>('22:00');
  const [sessFormTitle, setSessFormTitle] = useState<string>('');
  const [sessFormTopic, setSessFormTopic] = useState<string>('');
  const [sessFormCoveredContent, setSessFormCoveredContent] = useState<string>('');
  const [sessFormTeacherNotes, setSessFormTeacherNotes] = useState<string>('');
  const [sessFormHomework, setSessFormHomework] = useState<string>('');
  const [sessFormStatus, setSessFormStatus] = useState<string>('PENDING');
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Form states for Quick Action Modals
  const [coveredContent, setCoveredContent] = useState('');
  const [nextStartingPoint, setNextStartingPoint] = useState('');
  const [progressValue, setProgressValue] = useState('');
  const [homework, setHomework] = useState('');
  const [missReason, setMissReason] = useState('ব্যক্তিগত জরুরি কারণ');
  const [missNotes, setMissNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const daysOfWeek = [
    { key: 'SAT', label: 'শনি' },
    { key: 'SUN', label: 'রবি' },
    { key: 'MON', label: 'সোম' },
    { key: 'TUE', label: 'মঙ্গল' },
    { key: 'WED', label: 'বুধ' },
    { key: 'THU', label: 'বৃহঃ' },
    { key: 'FRI', label: 'শুক্র' },
  ];

  const dayKeyToBangla: Record<string, string> = {
    'SAT': 'শনি',
    'SUN': 'রবি',
    'MON': 'সোম',
    'TUE': 'মঙ্গল',
    'WED': 'বুধ',
    'THU': 'বৃহঃ',
    'FRI': 'শুক্র',
  };

  const bengaliWeekDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchCourses = async (preferredSelectedId?: number) => {
    try {
      setLoading(true);
      const res = await api.get<{ courses: Course[] }>('/courses');
      const loadedCourses = res.courses || [];
      setCourses(loadedCourses);

      const targetId = preferredSelectedId || selectedCourse?.id || (loadedCourses.length > 0 ? loadedCourses[0].id : null);
      if (targetId) {
        await loadCourseDetail(targetId);
      } else {
        setSelectedCourse(null);
        setSessions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetail = async (courseId: number) => {
    try {
      const res = await api.get<{ course: Course }>(`/courses/${courseId}`);
      setSelectedCourse(res.course);
      setSessions(res.course.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleToggleDay = (dayKey: string) => {
    setCourseFormRecurrenceDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  // ----------------------------------------------------
  // Course Handlers: Create, Edit, Delete
  // ----------------------------------------------------
  const openAddCourseModal = () => {
    setCourseFormTitle('');
    setCourseFormDescription('');
    setCourseFormTeacher('শায়খ মোখতার আহমাদ');
    setCourseFormTargetGroup('উচ্চতর শিক্ষার্থী ব্যাচ');
    setCourseFormMode('ONLINE');
    setCourseFormMeetingLink('');
    setCourseFormStartTime('21:00');
    setCourseFormDuration(60);
    setCourseFormRecurrenceDays(['MON', 'WED']);
    setIsAddCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCourseFormTitle(course.title);
    setCourseFormDescription(course.description || '');
    setCourseFormTeacher(course.teacher_name || 'শায়খ মোখতার আহমাদ');
    setCourseFormTargetGroup(course.target_group || 'উচ্চতর শিক্ষার্থী ব্যাচ');
    setCourseFormMode(course.mode || 'ONLINE');
    setCourseFormMeetingLink(course.meeting_link || '');
    setCourseFormStartTime(course.recurrence_rule?.start_time?.substring(0, 5) || '21:00');
    setCourseFormDuration(course.default_duration_minutes || 60);
    setCourseFormRecurrenceDays(course.recurrence_rule?.days || ['MON', 'WED']);
    setIsEditCourseModalOpen(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormTitle.trim()) return;

    setIsSubmittingCourse(true);
    try {
      const res = await api.post<{ id: number }>('/courses', {
        title: courseFormTitle,
        description: courseFormDescription,
        teacher_name: courseFormTeacher,
        target_group: courseFormTargetGroup,
        mode: courseFormMode,
        meeting_link: courseFormMeetingLink,
        start_date: new Date().toISOString().split('T')[0],
        recurrence_rule: {
          frequency: 'WEEKLY',
          days: courseFormRecurrenceDays,
          start_time: courseFormStartTime,
          duration_minutes: courseFormDuration
        },
        default_duration_minutes: courseFormDuration,
      });

      setIsAddCourseModalOpen(false);
      showToast('নতুন কোর্স সফলভাবে যোগ করা হয়েছে!');
      await fetchCourses(res.id);
    } catch (err: any) {
      alert(err.message || 'কোর্স তৈরি করা সম্ভব হয়নি');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !courseFormTitle.trim()) return;

    setIsSubmittingCourse(true);
    try {
      await api.put(`/courses/${selectedCourse.id}`, {
        title: courseFormTitle,
        description: courseFormDescription,
        teacher_name: courseFormTeacher,
        target_group: courseFormTargetGroup,
        mode: courseFormMode,
        meeting_link: courseFormMeetingLink,
        recurrence_rule: {
          frequency: 'WEEKLY',
          days: courseFormRecurrenceDays,
          start_time: courseFormStartTime,
          duration_minutes: courseFormDuration
        },
        default_duration_minutes: courseFormDuration,
      });

      setIsEditCourseModalOpen(false);
      showToast('কোর্সের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'কোর্স আপডেট করা সম্ভব হয়নি');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      showToast('কোর্স এবং এর সমস্ত সেশন সফলভাবে মুছে ফেলা হয়েছে।');
      setCourseToDelete(null);
      await fetchCourses();
    } catch (err: any) {
      alert(err.message || 'কোর্স মোছা সম্ভব হয়নি');
    }
  };

  // ----------------------------------------------------
  // Session Handlers: Add, Edit, Delete, Bulk Generate
  // ----------------------------------------------------
  const openAddSessionModal = () => {
    if (!selectedCourse) return;
    // Calculate next session number
    const maxNo = sessions.reduce((max, s) => Math.max(max, s.session_no || 0), 0);
    const nextNo = maxNo + 1;
    setSessFormNo(nextNo);
    setSessFormDate(new Date().toISOString().split('T')[0]);

    const defaultStart = selectedCourse.recurrence_rule?.start_time?.substring(0, 5) || '21:00';
    setSessFormStartTime(defaultStart);

    // Calculate end time by duration
    const dur = selectedCourse.default_duration_minutes || 60;
    const [h, m] = defaultStart.split(':').map(Number);
    const endMinutes = (h * 60 + m + dur) % (24 * 60);
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    setSessFormEndTime(`${endH}:${endM}`);

    setSessFormTitle(`ক্লাস #${nextNo}: বিষয়বস্তু নির্ধারণ`);
    setSessFormTopic(selectedCourse.title);
    setSessFormCoveredContent('');
    setSessFormTeacherNotes('');
    setSessFormHomework('');
    setSessFormStatus('PENDING');

    setIsAddSessionModalOpen(true);
  };

  const openEditSessionModal = (sess: ClassSession) => {
    setSessionToEdit(sess);
    setSessFormNo(sess.session_no);
    setSessFormDate(sess.date);
    setSessFormStartTime(sess.start_time?.substring(0, 5) || '21:00');
    setSessFormEndTime(sess.end_time?.substring(0, 5) || '22:00');
    setSessFormTitle(sess.lesson_title || `ক্লাস #${sess.session_no}`);
    setSessFormTopic(sess.topic || selectedCourse?.title || '');
    setSessFormCoveredContent(sess.covered_content || '');
    setSessFormTeacherNotes(sess.teacher_notes || '');
    setSessFormHomework(sess.homework || '');
    setSessFormStatus(sess.status || 'PENDING');
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsSubmittingSession(true);
    try {
      await api.post(`/courses/${selectedCourse.id}/sessions`, {
        session_no: sessFormNo,
        date: sessFormDate,
        start_time: sessFormStartTime,
        end_time: sessFormEndTime,
        lesson_title: sessFormTitle,
        topic: sessFormTopic,
        covered_content: sessFormCoveredContent,
        teacher_notes: sessFormTeacherNotes,
        homework: sessFormHomework,
        status: sessFormStatus
      });

      setIsAddSessionModalOpen(false);
      showToast(`ক্লাস #${toBengaliDigits(sessFormNo)} সফলভাবে যোগ করা হয়েছে!`);
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'ক্লাস সেশন যোগ করা সম্ভব হয়নি');
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToEdit || !selectedCourse) return;

    setIsSubmittingSession(true);
    try {
      await api.put(`/class-sessions/${sessionToEdit.id}`, {
        session_no: sessFormNo,
        date: sessFormDate,
        start_time: sessFormStartTime,
        end_time: sessFormEndTime,
        lesson_title: sessFormTitle,
        topic: sessFormTopic,
        covered_content: sessFormCoveredContent,
        teacher_notes: sessFormTeacherNotes,
        homework: sessFormHomework,
        status: sessFormStatus
      });

      setSessionToEdit(null);
      showToast(`ক্লাস #${toBengaliDigits(sessFormNo)} সফলভাবে আপডেট করা হয়েছে!`);
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'ক্লাস সেশন আপডেট করা সম্ভব হয়নি');
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete || !selectedCourse) return;
    try {
      await api.delete(`/class-sessions/${sessionToDelete.id}`);
      showToast('ক্লাস সেশনটি সফলভাবে মুছে ফেলা হয়েছে।');
      setSessionToDelete(null);
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'ক্লাস সেশন মোছা সম্ভব হয়নি');
    }
  };

  const handleGenerateSessions = async () => {
    if (!selectedCourse) return;
    try {
      await api.post(`/courses/${selectedCourse.id}/generate-sessions`, { months: 2 });
      showToast('পরবর্তী ২ মাসের পাঠ্যক্রমের ক্লাসসমূহ সফলভাবে তৈরি হয়েছে।');
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'ক্লাস তৈরি করতে সমস্যা হয়েছে');
    }
  };

  // ----------------------------------------------------
  // Quick Actions: Progress, Missed, Reschedule
  // ----------------------------------------------------
  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModalSession || !selectedCourse) return;
    try {
      await api.put(`/class-sessions/${progressModalSession.id}/progress`, {
        covered_content: coveredContent,
        next_starting_point: nextStartingPoint,
        progress_value: progressValue,
        homework: homework,
      });
      setProgressModalSession(null);
      setCoveredContent('');
      setNextStartingPoint('');
      setProgressValue('');
      setHomework('');
      showToast('অগ্রগতি রেকর্ড সংরক্ষণ করা হয়েছে!');
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'অগ্রগতি সংরক্ষণ করা যায়নি');
    }
  };

  const handleSaveMissed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missedModalSession || !selectedCourse) return;
    try {
      await api.put(`/class-sessions/${missedModalSession.id}/missed`, {
        miss_reason: missReason,
        miss_notes: missNotes,
      });
      setMissedModalSession(null);
      setMissNotes('');
      showToast('ক্লাসটি স্থগিত হিসেবে সংরক্ষণ করা হয়েছে।');
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'স্থগিত হিসেবে সংরক্ষণ করা যায়নি');
    }
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalSession || !rescheduleDate || !selectedCourse) return;
    try {
      await api.post(`/class-sessions/${rescheduleModalSession.id}/reschedule`, {
        new_date: rescheduleDate,
        reschedule_reason: rescheduleReason,
      });
      setRescheduleModalSession(null);
      setRescheduleDate('');
      setRescheduleReason('');
      showToast('ক্লাসটি সফলভাবে নতুন তারিখে পুনঃনির্ধারণ করা হয়েছে।');
      await loadCourseDetail(selectedCourse.id);
      await fetchCourses(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'পুনঃনির্ধারণ করা সম্ভব হয়নি');
    }
  };

  // Metrics calculations
  const totalCourses = courses.length;
  const totalCompletedSessions = courses.reduce(
    (acc, curr) => acc + (Number(curr.completed_sessions) || 0),
    0
  );
  const totalScheduledSessions = courses.reduce(
    (acc, curr) => acc + (Number(curr.total_sessions) || 0),
    0
  );
  const overallRate = totalScheduledSessions > 0
    ? Math.round((totalCompletedSessions / totalScheduledSessions) * 100)
    : 0;

  // Filter sessions
  const filteredSessions = sessions.filter((sess) => {
    if (sessionFilter === 'ALL') return true;
    if (sessionFilter === 'UPCOMING') return sess.status === 'PENDING' || sess.status === 'IN_PROGRESS';
    if (sessionFilter === 'COMPLETED') return sess.status === 'COMPLETED';
    if (sessionFilter === 'MISSED') return sess.status === 'MISSED';
    if (sessionFilter === 'RESCHEDULED') return sess.status === 'RESCHEDULED';
    return true;
  });

  return (
    <div className="space-y-6 font-bengali">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#063F35] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#00A878]/30 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={18} className="text-[#00A878]" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* 1. Top Strip & Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5F0] text-[#063F35] flex items-center justify-center shrink-0 border border-[#00A878]/20">
            <QuranRehalIcon size={22} strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">চলমান কোর্স</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(totalCourses)}টি কারিকুলাম</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#063F35] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-[#00A878]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">সম্পন্ন ক্লাস</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(totalCompletedSessions)}টি সেশন</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">পাঠ্যক্রম অগ্রগতি</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">{toBengaliDigits(overallRate)}% সম্পন্ন</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4EBE8] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E8F5F0] text-[#063F35] flex items-center justify-center shrink-0 border border-[#00A878]/20">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#17211F]/60 uppercase tracking-widest block">পাঠদান স্তর</span>
            <span className="text-xl sm:text-2xl font-black text-[#17211F]">উচ্চতর ইলমি</span>
          </div>
        </div>
      </div>

      {/* 2. Course Header & Navigation Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#063F35] text-white flex items-center justify-center shrink-0 shadow-xs">
              <QuranRehalIcon size={20} strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#063F35] uppercase tracking-widest flex items-center gap-1.5">
                <CrescentStarIcon size={12} className="text-[#00A878]" />
                কুরআনিক ও দ্বীনি পাঠ্যক্রম
              </span>
              <h2 className="text-xl font-bold text-[#17211F]">
                একাডেমিক কোর্স ও ক্লাসরুটিন
              </h2>
            </div>
          </div>

          <button
            onClick={openAddCourseModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-95"
          >
            <Plus size={16} />
            <span>+ নতুন কোর্স তৈরি করুন</span>
          </button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            const completed = Number(course.completed_sessions) || 0;
            const total = Number(course.total_sessions) || 0;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const formattedDays = course.recurrence_rule?.days
              ? course.recurrence_rule.days.map((d: string) => dayKeyToBangla[d] || d).join(', ')
              : 'সাপ্তাহিক';

            return (
              <div
                key={course.id}
                onClick={() => loadCourseDetail(course.id)}
                className={`p-5 sm:p-6 rounded-2xl transition cursor-pointer text-left relative overflow-hidden group border ${
                  isSelected
                    ? 'border-[#063F35] bg-[#E8F5F0]/30 shadow-md ring-2 ring-[#00A878]/30'
                    : 'border-[#E4EBE8] hover:border-[#00A878]/40 hover:shadow-xs bg-white'
                }`}
              >
                {/* Top Badge Row & Action Icons */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    course.mode === 'ONLINE'
                      ? 'bg-[#E8F5F0] text-[#063F35] border border-[#00A878]/20'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {course.mode === 'ONLINE' ? <Video size={12} /> : <QuranRehalIcon size={12} />}
                    {course.mode === 'ONLINE' ? 'অনলাইন' : course.mode === 'OFFLINE' ? 'সরাসরি' : 'হাইব্রিড'}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#17211F]/60 font-bengali mr-1">
                      {toBengaliDigits(completed)} / {toBengaliDigits(total)} ক্লাস
                    </span>
                    <button
                      title="কোর্স সম্পাদনা"
                      onClick={(e) => openEditCourseModal(course, e)}
                      className="p-1 text-slate-400 hover:text-[#063F35] hover:bg-[#E8F5F0] rounded-lg transition"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      title="কোর্স মুছুন"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseToDelete(course);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#17211F] mt-3 group-hover:text-[#063F35] transition">
                  {course.title}
                </h3>
                <p className="text-xs text-[#17211F]/65 line-clamp-2 mt-1.5 leading-relaxed">
                  {course.description || 'ধারাবাহিক ইলমি পাঠ্যক্রম ও তাফসির সিলেবাস।'}
                </p>

                {/* Recurrence Chip */}
                <div className="mt-3 flex items-center gap-2 text-[#17211F]/65 text-[11px] font-medium">
                  <Clock size={12} className="text-[#00A878] shrink-0" />
                  <span>{formattedDays} • {toBengaliDigits(course.recurrence_rule?.start_time || '২১:০০')}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-3.5 border-t border-[#E4EBE8]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] text-[#17211F]/60 font-medium">অগ্রগতি: <strong className="text-[#063F35]">{course.current_progress || 'চলমান সেশন'}</strong></span>
                    <span className="font-extrabold text-[#063F35] text-[11px]">{toBengaliDigits(pct)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E4EBE8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00A878] to-[#063F35] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Course Detailed Sessions View */}
      {selectedCourse && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white space-y-6 shadow-xs border border-[#E4EBE8]">
          {/* Header of Detail Panel */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E4EBE8] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#063F35] uppercase tracking-widest flex items-center gap-1">
                  <RubElHizbIcon size={14} className="text-[#00A878]" />
                  পাঠ্যক্রম সেশন ও ক্লাসের ইতিহাস
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E8F5F0] text-[#063F35] font-bold">
                  {selectedCourse.mode === 'ONLINE' ? 'অনলাইন' : selectedCourse.mode === 'OFFLINE' ? 'সরাসরি' : 'হাইব্রিড'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#17211F] mt-1">
                {selectedCourse.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#17211F]/60 mt-1.5">
                <span>শিক্ষক: <strong className="text-[#17211F]">{selectedCourse.teacher_name}</strong></span>
                <span>•</span>
                <span>ব্যাচ: <strong className="text-[#17211F]">{selectedCourse.target_group || 'উচ্চতর শিক্ষার্থী'}</strong></span>
                <span>•</span>
                <span>দিনসমূহ: <strong className="text-[#17211F]">
                  {selectedCourse.recurrence_rule?.days
                    ? selectedCourse.recurrence_rule.days.map((d: string) => dayKeyToBangla[d] || d).join(', ')
                    : 'নির্ধারিত রুটিন'}
                </strong> ({toBengaliDigits(selectedCourse.recurrence_rule?.start_time || '২১:০০')})</span>
                {selectedCourse.meeting_link && (
                  <>
                    <span>•</span>
                    <a
                      href={selectedCourse.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#063F35] hover:text-[#00A878] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Video size={12} /> ক্লাসরুম লিংক <ExternalLink size={10} />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons for Selected Course */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={openAddSessionModal}
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-95"
              >
                <Plus size={15} />
                <span>+ নির্দিষ্ট ক্লাস সেশন যোগ করুন</span>
              </button>

              <button
                onClick={() => openEditCourseModal(selectedCourse)}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-white border border-[#E4EBE8] hover:bg-[#F7F9F7] text-[#17211F] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Edit3 size={14} className="text-[#063F35]" />
                <span>কোর্স সম্পাদনা</span>
              </button>

              <button
                onClick={handleGenerateSessions}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-[#E8F5F0] hover:bg-[#d5eee4] text-[#063F35] text-xs font-bold rounded-xl transition cursor-pointer border border-[#00A878]/20"
                title="পরবর্তী ২ মাসের ক্লাস স্বয়ংক্রিয়ভাবে তৈরি করুন"
              >
                <RotateCw size={13} />
                <span>+ ২ মাসের রুটিন</span>
              </button>

              <button
                onClick={() => setCourseToDelete(selectedCourse)}
                className="p-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                title="কোর্সটি মুছুন"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#17211F]/70 flex items-center gap-1 mr-1">
                <Filter size={13} className="text-[#00A878]" /> ফিল্টার:
              </span>
              {(
                [
                  { id: 'ALL', label: 'সকল ক্লাস' },
                  { id: 'UPCOMING', label: 'আসন্ন' },
                  { id: 'COMPLETED', label: 'সম্পন্ন' },
                  { id: 'MISSED', label: 'স্থগিত' },
                  { id: 'RESCHEDULED', label: 'পুনঃনির্ধারিত' },
                ] as const
              ).map((filterItem) => (
                <button
                  key={filterItem.id}
                  onClick={() => setSessionFilter(filterItem.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    sessionFilter === filterItem.id
                      ? 'bg-[#063F35] text-white shadow-xs'
                      : 'bg-[#F7F9F7] text-[#17211F]/70 hover:bg-[#E4EBE8] border border-[#E4EBE8]'
                  }`}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#17211F]/60">
              মোট: <strong className="text-[#063F35]">{toBengaliDigits(filteredSessions.length)}</strong>টি ক্লাস সেশন
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((sess) => {
                const isCompleted = sess.status === 'COMPLETED';
                const isMissed = sess.status === 'MISSED';
                const isRescheduled = sess.status === 'RESCHEDULED';
                const isCancelled = sess.status === 'CANCELLED';
                const dateObj = new Date(sess.date + 'T00:00:00');
                const dayName = isNaN(dateObj.getTime()) ? 'দিন' : bengaliWeekDays[dateObj.getDay()];
                const dayNum = isNaN(dateObj.getTime()) ? sess.date : toBengaliDigits(dateObj.getDate());
                const monthName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('bn-BD', { month: 'short' });

                return (
                  <div
                    key={sess.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border shadow-xs hover:shadow-md transition ${
                      isCompleted
                        ? 'border-[#00A878]/30 bg-[#E8F5F0]/20'
                        : isMissed
                        ? 'border-rose-200 bg-rose-50/20'
                        : isRescheduled
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-[#E4EBE8] hover:border-[#00A878]/40'
                    }`}
                  >
                    {/* Left: Date Block + Time */}
                    <div className="flex items-center space-x-3.5 shrink-0">
                      <div className="text-center w-14 shrink-0 bg-[#F7F9F7] py-2 rounded-xl border border-[#E4EBE8]">
                        <span className={`text-[11px] font-bold block leading-none ${!isCompleted && !isMissed ? 'text-[#063F35]' : 'text-[#17211F]/40'}`}>
                          {dayName}
                        </span>
                        <span className="text-xl font-black text-[#17211F] block mt-1">
                          {dayNum}
                        </span>
                        <span className="text-[10px] text-[#17211F]/50 block">
                          {monthName}
                        </span>
                      </div>

                      {/* Time & Session Number */}
                      <div className="space-y-1 min-w-[150px]">
                        <div className="flex items-center gap-1.5 text-xs text-[#17211F] font-semibold">
                          <Clock size={12} className="text-[#00A878]" />
                          <span>{toBengaliDigits(sess.start_time?.substring(0, 5) || '')} - {toBengaliDigits(sess.end_time?.substring(0, 5) || '')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5F0] text-[#063F35] border border-[#00A878]/20">
                            ক্লাস #{toBengaliDigits(sess.session_no)}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : isMissed
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isRescheduled
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isCancelled
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-[#063F35] text-white'
                            }`}
                          >
                            {isCompleted ? 'সম্পন্ন' : isMissed ? 'স্থগিত' : isRescheduled ? 'পুনঃনির্ধারিত' : isCancelled ? 'বাতিল' : 'আসন্ন'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Content Covered / Lesson Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#17211F]">
                          {sess.lesson_title || `ক্লাস #${toBengaliDigits(sess.session_no)}`}
                        </span>
                        {sess.topic && sess.topic !== selectedCourse.title && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F7F9F7] text-[#17211F]/70 border border-[#E4EBE8]">
                            {sess.topic}
                          </span>
                        )}
                      </div>

                      {sess.covered_content ? (
                        <div className="text-xs text-[#17211F] bg-[#F7F9F7] p-3 rounded-xl border border-[#E4EBE8] space-y-1 mt-1.5">
                          <p>
                            <strong className="text-[#063F35]">পঠিত অংশ:</strong> {sess.covered_content}
                          </p>
                          {sess.next_starting_point && (
                            <p className="text-[#063F35] font-medium">
                              <strong>পরবর্তী পাঠ:</strong> {sess.next_starting_point}
                            </p>
                          )}
                          {sess.homework && (
                            <p className="text-amber-900 text-[11px] bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                              <strong>হোমওয়ার্ক / বাড়ির কাজ:</strong> {sess.homework}
                            </p>
                          )}
                          {sess.teacher_notes && (
                            <p className="text-[#17211F]/70 text-[11px]">
                              <strong>শিক্ষকের নোট:</strong> {sess.teacher_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-[#17211F]/60">
                          <p className="font-medium text-[#17211F]">
                            {selectedCourse.title}-এর নির্ধারিত রুটিন পাঠ
                          </p>
                          {sess.teacher_notes && (
                            <p className="text-[11px] text-[#063F35] mt-1 bg-[#E8F5F0]/60 p-1.5 rounded-lg border border-[#00A878]/20">
                              নোট: {sess.teacher_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {isMissed && (
                        <p className="text-xs text-rose-700 font-medium mt-1.5 bg-rose-50 p-2 rounded-xl border border-rose-100">
                          <strong>স্থগিতের কারণ:</strong> {sess.miss_reason}{' '}
                          {sess.miss_notes ? `(${sess.miss_notes})` : ''}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 md:pt-0 self-end md:self-center">
                      {!isCompleted && !isRescheduled && (
                        <button
                          onClick={() => {
                            setProgressModalSession(sess);
                            setCoveredContent(sess.covered_content || '');
                            setNextStartingPoint(sess.next_starting_point || '');
                            setProgressValue(sess.progress_value || '');
                            setHomework(sess.homework || '');
                          }}
                          className="px-3.5 py-2 bg-[#063F35] hover:bg-[#042F28] active:scale-95 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 size={13} className="text-[#00A878]" />
                          <span>অগ্রগতি রেকর্ড</span>
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => {
                            setProgressModalSession(sess);
                            setCoveredContent(sess.covered_content || '');
                            setNextStartingPoint(sess.next_starting_point || '');
                            setProgressValue(sess.progress_value || '');
                            setHomework(sess.homework || '');
                          }}
                          className="px-3 py-2 bg-[#F7F9F7] hover:bg-[#E4EBE8] text-[#17211F] text-xs font-bold rounded-xl transition cursor-pointer border border-[#E4EBE8]"
                        >
                          লগ সংশোধন
                        </button>
                      )}

                      {/* Edit Session Button */}
                      <button
                        title="ক্লাস তথ্য সম্পাদনা"
                        onClick={() => openEditSessionModal(sess)}
                        className="px-3 py-2 bg-white border border-[#E4EBE8] hover:bg-[#E8F5F0] hover:text-[#063F35] text-[#17211F]/80 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>সম্পাদনা</span>
                      </button>

                      {!isCompleted && !isRescheduled && (
                        <>
                          <button
                            onClick={() => setMissedModalSession(sess)}
                            className="px-2.5 py-2 bg-white border border-[#E4EBE8] hover:bg-rose-50 hover:text-rose-700 text-[#17211F]/70 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            স্থগিত
                          </button>
                          <button
                            onClick={() => setRescheduleModalSession(sess)}
                            className="px-2.5 py-2 bg-white border border-[#E4EBE8] hover:bg-[#F7F9F7] text-[#17211F]/70 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            পুনঃনির্ধারণ
                          </button>
                        </>
                      )}

                      {/* Delete Session Button */}
                      <button
                        title="ক্লাস মুছুন"
                        onClick={() => setSessionToDelete(sess)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-[#F7F9F7] rounded-2xl border border-dashed border-[#E4EBE8]">
                <QuranRehalIcon size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-[#17211F]/60 font-medium">
                  এই ফিল্টারে কোনো ক্লাস খুঁজে পাওয়া যায়নি।
                </p>
                <button
                  onClick={openAddSessionModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#063F35] text-white text-xs font-bold rounded-xl hover:bg-[#042F28] transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>এখনই একটি ক্লাস সেশন যোগ করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 1: CREATE NEW COURSE
         ======================================================= */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateCourse}
            className="max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <QuranRehalIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    নতুন দ্বীনি কোর্স যোগ করুন
                  </h3>
                  <p className="text-xs text-[#17211F]/60">পাঠ্যক্রম, সাপ্তাহিক রুটিন ও ব্যাচ বিবরণ নির্ধারণ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কোর্স বা পাঠ্যক্রমের শিরোনাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: তাফসিরুল কুরআন ও সমকালীন প্রাসঙ্গিকতা"
                value={courseFormTitle}
                onChange={(e) => setCourseFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] focus:outline-hidden text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শিক্ষকের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শায়খ মোখতার আহমাদ"
                  value={courseFormTeacher}
                  onChange={(e) => setCourseFormTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শিক্ষার্থী ব্যাচ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: উচ্চতর শিক্ষার্থী ব্যাচ ০২"
                  value={courseFormTargetGroup}
                  onChange={(e) => setCourseFormTargetGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  পাঠদান মাধ্যম *
                </label>
                <select
                  value={courseFormMode}
                  onChange={(e) => setCourseFormMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] bg-white text-[#17211F]"
                >
                  <option value="ONLINE">অনলাইন (জুম / গুগল মিট)</option>
                  <option value="OFFLINE">সরাসরি (হলকা / মাদ্রাসা)</option>
                  <option value="HYBRID">হাইব্রিড</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  ক্লাসরুম / মিটিং লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={courseFormMeetingLink}
                  onChange={(e) => setCourseFormMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                সাপ্তাহিক ক্লাসের দিনসমূহ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map((day) => {
                  const isChecked = courseFormRecurrenceDays.includes(day.key);
                  return (
                    <button
                      type="button"
                      key={day.key}
                      onClick={() => handleToggleDay(day.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isChecked
                          ? 'bg-[#063F35] text-white shadow-xs'
                          : 'bg-[#F7F9F7] text-[#17211F]/70 hover:bg-[#E4EBE8] border border-[#E4EBE8]'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শুরুর সময় *
                </label>
                <input
                  type="time"
                  required
                  value={courseFormStartTime}
                  onChange={(e) => setCourseFormStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  সময়কাল (মিনিট)
                </label>
                <input
                  type="number"
                  min="30"
                  step="15"
                  value={courseFormDuration}
                  onChange={(e) => setCourseFormDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কোর্স সিলেবাস বা বিবরণ
              </label>
              <textarea
                rows={2}
                placeholder="অধ্যায়, মূল কিতাব ও লক্ষ্যমাত্রার সংক্ষিপ্ত সারসংক্ষেপ..."
                value={courseFormDescription}
                onChange={(e) => setCourseFormDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingCourse}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmittingCourse ? 'তৈরি করা হচ্ছে...' : 'কোর্স নিশ্চিত করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 2: EDIT COURSE
         ======================================================= */}
      {isEditCourseModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleUpdateCourse}
            className="max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    কোর্সের তথ্য সম্পাদনা
                  </h3>
                  <p className="text-xs text-[#17211F]/60">কোর্সের শিরোনাম, রুটিন ও বিবরণ পরিবর্তন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCourseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কোর্স বা পাঠ্যক্রমের শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={courseFormTitle}
                onChange={(e) => setCourseFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] focus:outline-hidden text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শিক্ষকের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={courseFormTeacher}
                  onChange={(e) => setCourseFormTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শিক্ষার্থী ব্যাচ
                </label>
                <input
                  type="text"
                  value={courseFormTargetGroup}
                  onChange={(e) => setCourseFormTargetGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  পাঠদান মাধ্যম *
                </label>
                <select
                  value={courseFormMode}
                  onChange={(e) => setCourseFormMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] bg-white text-[#17211F]"
                >
                  <option value="ONLINE">অনলাইন (জুম / গুগল মিট)</option>
                  <option value="OFFLINE">সরাসরি (হলকা / মাদ্রাসা)</option>
                  <option value="HYBRID">হাইব্রিড</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  ক্লাসরুম / মিটিং লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={courseFormMeetingLink}
                  onChange={(e) => setCourseFormMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                সাপ্তাহিক ক্লাসের দিনসমূহ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map((day) => {
                  const isChecked = courseFormRecurrenceDays.includes(day.key);
                  return (
                    <button
                      type="button"
                      key={day.key}
                      onClick={() => handleToggleDay(day.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isChecked
                          ? 'bg-[#063F35] text-white shadow-xs'
                          : 'bg-[#F7F9F7] text-[#17211F]/70 hover:bg-[#E4EBE8] border border-[#E4EBE8]'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শুরুর সময় *
                </label>
                <input
                  type="time"
                  required
                  value={courseFormStartTime}
                  onChange={(e) => setCourseFormStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  সময়কাল (মিনিট)
                </label>
                <input
                  type="number"
                  min="30"
                  step="15"
                  value={courseFormDuration}
                  onChange={(e) => setCourseFormDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কোর্স সিলেবাস বা বিবরণ
              </label>
              <textarea
                rows={2}
                value={courseFormDescription}
                onChange={(e) => setCourseFormDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsEditCourseModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingCourse}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmittingCourse ? 'সংরক্ষণ হচ্ছে...' : 'হালনাগাদ সম্পন্ন করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 3: ADD CLASS SESSION (কোন দিন কী ক্লাস, কতো নম্বর ক্লাস এবং বিস্তারিত)
         ======================================================= */}
      {isAddSessionModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateSession}
            className="max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    নির্দিষ্ট ক্লাস সেশন যোগ করুন
                  </h3>
                  <p className="text-xs text-[#17211F]/60">
                    {selectedCourse.title} • দিন, নম্বর ও বিস্তারিত নির্ধারণ করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSessionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  কতো নম্বর ক্লাস? (Class #) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sessFormNo}
                  onChange={(e) => setSessFormNo(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#063F35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  কোন দিন? (তারিখ) *
                </label>
                <input
                  type="date"
                  required
                  value={sessFormDate}
                  onChange={(e) => setSessFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শুরুর সময় *
                </label>
                <input
                  type="time"
                  required
                  value={sessFormStartTime}
                  onChange={(e) => setSessFormStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  সমাপ্তির সময় *
                </label>
                <input
                  type="time"
                  required
                  value={sessFormEndTime}
                  onChange={(e) => setSessFormEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কী ক্লাস / পাঠের শিরোনাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: ক্লাস #৫: সূরা আল-বাক্বারাহ আয়াত ২৫৫ (আয়াতুল কুরসী) তাফসির"
                value={sessFormTitle}
                onChange={(e) => setSessFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                মূল বিষয় / টপিক
              </label>
              <input
                type="text"
                placeholder="যেমন: তাওহীদ ও আল্লাহর সিফাত"
                value={sessFormTopic}
                onChange={(e) => setSessFormTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                বিস্তারিত পাঠ্যক্রম / পঠিত অংশ
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: আয়াতের প্রতিটি শব্দের ব্যাখ্যা, ফজিলত এবং প্রাত্যহিক আমলসমূহ..."
                value={sessFormCoveredContent}
                onChange={(e) => setSessFormCoveredContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  হোমওয়ার্ক / শিক্ষার্থীদের করণীয়
                </label>
                <input
                  type="text"
                  placeholder="যেমন: আয়াতুল কুরসী অর্থসহ মুখস্থ"
                  value={sessFormHomework}
                  onChange={(e) => setSessFormHomework(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  ক্লাস স্ট্যাটাস
                </label>
                <select
                  value={sessFormStatus}
                  onChange={(e) => setSessFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="PENDING">আসন্ন (Pending)</option>
                  <option value="COMPLETED">সম্পন্ন (Completed)</option>
                  <option value="MISSED">স্থগিত (Missed)</option>
                  <option value="RESCHEDULED">পুনঃনির্ধারিত (Rescheduled)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                শিক্ষকের বিশেষ নির্দেশনা বা নোট
              </label>
              <textarea
                rows={1}
                placeholder="ক্লাস সংক্রান্ত বিশেষ কোনো নির্দেশনা থাকলে লিখুন..."
                value={sessFormTeacherNotes}
                onChange={(e) => setSessFormTeacherNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setIsAddSessionModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingSession}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmittingSession ? 'যোগ করা হচ্ছে...' : 'ক্লাস সেশন নিশ্চিত করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 4: EDIT CLASS SESSION (পরে চাইলে এডিট করা যাবে)
         ======================================================= */}
      {sessionToEdit && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleUpdateSession}
            className="max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl max-h-[90vh] overflow-y-auto border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#063F35] text-white flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211F]">
                    ক্লাস সেশন সম্পাদনা (ক্লাস #{toBengaliDigits(sessionToEdit.session_no)})
                  </h3>
                  <p className="text-xs text-[#17211F]/60">
                    দিন, ক্লাসের নম্বর, শিরোনাম, সময় ও বিস্তারিত তথ্য সংশোধন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSessionToEdit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#F7F9F7] rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  কতো নম্বর ক্লাস? (Class #) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sessFormNo}
                  onChange={(e) => setSessFormNo(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#063F35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  কোন দিন? (তারিখ) *
                </label>
                <input
                  type="date"
                  required
                  value={sessFormDate}
                  onChange={(e) => setSessFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  শুরুর সময় *
                </label>
                <input
                  type="time"
                  required
                  value={sessFormStartTime}
                  onChange={(e) => setSessFormStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  সমাপ্তির সময় *
                </label>
                <input
                  type="time"
                  required
                  value={sessFormEndTime}
                  onChange={(e) => setSessFormEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                কী ক্লাস / পাঠের শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={sessFormTitle}
                onChange={(e) => setSessFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                মূল বিষয় / টপিক
              </label>
              <input
                type="text"
                value={sessFormTopic}
                onChange={(e) => setSessFormTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                বিস্তারিত পাঠ্যক্রম / পঠিত অংশ
              </label>
              <textarea
                rows={2}
                value={sessFormCoveredContent}
                onChange={(e) => setSessFormCoveredContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  হোমওয়ার্ক / শিক্ষার্থীদের করণীয়
                </label>
                <input
                  type="text"
                  value={sessFormHomework}
                  onChange={(e) => setSessFormHomework(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                  ক্লাস স্ট্যাটাস
                </label>
                <select
                  value={sessFormStatus}
                  onChange={(e) => setSessFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
                >
                  <option value="PENDING">আসন্ন (Pending)</option>
                  <option value="COMPLETED">সম্পন্ন (Completed)</option>
                  <option value="MISSED">স্থগিত (Missed)</option>
                  <option value="RESCHEDULED">পুনঃনির্ধারিত (Rescheduled)</option>
                  <option value="CANCELLED">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                শিক্ষকের বিশেষ নির্দেশনা বা নোট
              </label>
              <textarea
                rows={1}
                value={sessFormTeacherNotes}
                onChange={(e) => setSessFormTeacherNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setSessionToEdit(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmittingSession}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                {isSubmittingSession ? 'সংরক্ষণ হচ্ছে...' : 'হালনাগাদ সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 5: CONFIRM DELETE COURSE
         ======================================================= */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold">কোর্স মুছে ফেলার নিশ্চিতকরণ</h3>
                <p className="text-xs text-[#17211F]/60">এই পদক্ষেপটি পূর্বাবস্থায় ফিরিয়ে আনা সম্ভব নয়</p>
              </div>
            </div>

            <p className="text-xs text-[#17211F]/80 leading-relaxed bg-[#F7F9F7] p-3 rounded-xl border border-[#E4EBE8]">
              আপনি কি নিশ্চিত যে আপনি <strong className="text-rose-700">{courseToDelete.title}</strong> কোর্স এবং এর সাথে যুক্ত সমস্ত ক্লাস সেশন ও রুটিন মুছে ফেলতে চান?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl cursor-pointer shadow-xs transition"
              >
                হ্যাঁ, নিশ্চিত মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 6: CONFIRM DELETE SESSION
         ======================================================= */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold">ক্লাস সেশন মুছে ফেলা</h3>
                <p className="text-xs text-[#17211F]/60">ক্লাস #{toBengaliDigits(sessionToDelete.session_no)} ({sessionToDelete.date})</p>
              </div>
            </div>

            <p className="text-xs text-[#17211F]/80 leading-relaxed bg-[#F7F9F7] p-3 rounded-xl border border-[#E4EBE8]">
              আপনি কি নিশ্চিত যে আপনি এই ক্লাস সেশনটি ক্যালেন্ডার এবং কোর্স তালিকা থেকে স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl cursor-pointer shadow-xs transition"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 7: LOG PROGRESS
         ======================================================= */}
      {progressModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveProgress}
            className="max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17211F]">
                  অগ্রগতি রেকর্ড: ক্লাস #{toBengaliDigits(progressModalSession.session_no)}
                </h3>
                <p className="text-xs text-[#17211F]/60">পঠিত পাঠ, পরবর্তী অংশ ও হোমওয়ার্ক লিপিবদ্ধ করুন</p>
              </div>
              <button
                type="button"
                onClick={() => setProgressModalSession(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                পঠিত বিষয় বা আয়াতসমূহ *
              </label>
              <textarea
                required
                rows={2}
                placeholder="যেমন: সূরা আল-বাক্বারাহ আয়াত ১২৫–১৩০, অর্থ ও শানে নুযুল"
                value={coveredContent}
                onChange={(e) => setCoveredContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                পরবর্তী পাঠের শুরুর অংশ *
              </label>
              <input
                type="text"
                placeholder="যেমন: আগামী ক্লাসে আয়াত ১৩১ থেকে শুরু হবে"
                value={nextStartingPoint}
                onChange={(e) => setNextStartingPoint(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl focus:ring-2 focus:ring-[#00A878] text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                হোমওয়ার্ক / শিক্ষার্থীদের অনুশীলনী
              </label>
              <input
                type="text"
                placeholder="যেমন: আয়াত ১২৮ মুখস্থ করা ও নোট রিভিশন"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                সিলেবাসের অগ্রগতি মাইলস্টোন
              </label>
              <input
                type="text"
                placeholder="যেমন: আয়াত ১৩০ / রুকু ১৬"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setProgressModalSession(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                অগ্রগতি সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 8: MARK MISSED
         ======================================================= */}
      {missedModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveMissed}
            className="max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17211F]">
                  ক্লাস স্থগিত রেকর্ড: সেশন #{toBengaliDigits(missedModalSession.session_no)}
                </h3>
                <p className="text-xs text-[#17211F]/60">
                  ক্লাসের রেকর্ড সংরক্ষিত থাকবে। পরবর্তীতে নতুন তারিখে পুনঃনির্ধারণ করতে পারবেন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMissedModalSession(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">স্থগিতের কারণ *</label>
              <select
                value={missReason}
                onChange={(e) => setMissReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl bg-white text-[#17211F]"
              >
                <option value="ব্যক্তিগত জরুরি কারণ">ব্যক্তিগত জরুরি কারণ</option>
                <option value="দ্বীনি সফর ও দাওয়াতি কর্মসূচি">দ্বীনি সফর ও দাওয়াতি কর্মসূচি</option>
                <option value="অন্যান্য কর্মসূচির সাথে সময় সমন্বয়">অন্যান্য কর্মসূচির সাথে সময় সমন্বয়</option>
                <option value="শিক্ষক অনুপস্থিতি">শিক্ষক অনুপস্থিতি</option>
                <option value="শিক্ষার্থীদের সম্মিলিত অনুরোধ">শিক্ষার্থীদের সম্মিলিত অনুরোধ</option>
                <option value="ইন্টারনেট বা প্রযুক্তিগত সমস্যা">ইন্টারনেট বা প্রযুক্তিগত সমস্যা</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                অতিরিক্ত নোট
              </label>
              <textarea
                rows={2}
                placeholder="প্রয়োজনীয় অতিরিক্ত মন্তব্য..."
                value={missNotes}
                onChange={(e) => setMissNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setMissedModalSession(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl cursor-pointer shadow-xs transition"
              >
                স্থগিত নিশ্চিত করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          MODAL 9: RESCHEDULE
         ======================================================= */}
      {rescheduleModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveReschedule}
            className="max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl bg-white rounded-3xl border border-[#E4EBE8]"
          >
            <div className="flex items-center justify-between border-b border-[#E4EBE8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17211F]">
                  ক্লাস পুনঃনির্ধারণ: সেশন #{toBengaliDigits(rescheduleModalSession.session_no)}
                </h3>
                <p className="text-xs text-[#17211F]/60">
                  ক্লাসটি নতুন তারিখে স্থানান্তরিত হবে এবং ক্যালেন্ডারে আপডেট হবে।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalSession(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">
                নতুন তারিখ *
              </label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211F] mb-1.5">পুনঃনির্ধারণের কারণ</label>
              <input
                type="text"
                placeholder="যেমন: শুক্রবারের জুমু'আ লেকচারের কারণে স্থানান্তর"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E4EBE8] rounded-xl text-[#17211F]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E4EBE8]">
              <button
                type="button"
                onClick={() => setRescheduleModalSession(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#17211F]/70 hover:bg-[#F7F9F7] rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#063F35] hover:bg-[#042F28] rounded-xl cursor-pointer shadow-xs transition"
              >
                পুনঃনির্ধারণ নিশ্চিত করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
