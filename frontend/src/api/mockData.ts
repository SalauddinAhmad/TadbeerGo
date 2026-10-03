import { getLocalDateString } from '../utils/bengali';
import { Course, JumuaEvent, Mosque, Programme, Activity, User } from '../types';

// Helper to get relative dates in YYYY-MM-DD
function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
}

// Current dynamic dates
const today = getLocalDateString(new Date());
const tomorrow = getRelativeDate(1);
const dayAfter = getRelativeDate(2);
const nextWeek = getRelativeDate(5);

// ==========================================
// 1. MOCK MOSQUES
// ==========================================
export const initialMockMosques: Mosque[] = [
  {
    id: 1,
    name: 'বায়তুল মুকাররম জাতীয় মসজিদ',
    address: 'তোপখানা রোড, পল্টন, ঢাকা',
    district: 'ঢাকা',
    maps_url: 'https://maps.google.com/?q=Baitul+Mukarram+National+Mosque',
    contact_person: 'মাওলানা মিজানুর রহমান',
    phone: '01711-223344',
    whatsapp: '01711-223344',
    notes: 'কেন্দ্রীয় জাতীয় মসজিদ, বিশাল জামাত'
  },
  {
    id: 2,
    name: 'বাইতুল আমান জামে মসজিদ',
    address: 'রোড নং ৮, ধানমন্ডি আ/এ, ঢাকা',
    district: 'ঢাকা',
    maps_url: 'https://maps.google.com/?q=Baitul+Aman+Jame+Masjid+Dhanmondi',
    contact_person: 'মুতাওয়াল্লী হাজী রফিকুল ইসলাম',
    phone: '01722-334455',
    whatsapp: '01722-334455',
    notes: 'নিয়মিত জুমুআ খুতবাহ ও আলোচনা কেন্দ্র'
  },
  {
    id: 3,
    name: 'সোবহানবাগ জামে মসজিদ',
    address: 'ধানমন্ডি ২৭ (মিরপুর রোড), ঢাকা',
    district: 'ঢাকা',
    maps_url: 'https://maps.google.com/?q=Sobhanbagh+Jame+Masjid',
    contact_person: 'জেনারেল সেক্রেটারি হাফেজ কাসেম',
    phone: '01811-998877',
    whatsapp: '01811-998877',
    notes: 'উন্নত অডিও সিস্টেম ও লাইব্রেরি সুবিধা'
  },
  {
    id: 4,
    name: 'গুলশান সোসাইটি জামে মসজিদ',
    address: 'রোড ৬৩, গুলশান ২, ঢাকা',
    district: 'ঢাকা',
    maps_url: 'https://maps.google.com/?q=Gulshan+Society+Jame+Masjid',
    contact_person: 'ইঞ্জিনিয়ার শাহাবুদ্দিন আহমেদ',
    phone: '01911-445566',
    whatsapp: '01911-445566',
    notes: 'মাল্টিমিডিয়া ও সুশৃঙ্খল পরিবেশ'
  },
  {
    id: 5,
    name: 'উত্তরা সেক্টর ৭ জামে মসজিদ',
    address: 'রোড ১, সেক্টর ৭, উত্তরা, ঢাকা',
    district: 'ঢাকা',
    maps_url: 'https://maps.google.com/?q=Uttara+Sector+7+Jame+Masjid',
    contact_person: 'ড. মুস্তাফিজুর রহমান',
    phone: '01611-332211',
    whatsapp: '01611-332211',
    notes: 'শিক্ষার্থী ও তরুণ সমাজের বিপুল উপস্থিতি'
  }
];

// ==========================================
// 2. MOCK JUMU'AH SCHEDULE (OCTOBER 2026)
// ==========================================
export const initialMockFridays: JumuaEvent[] = [
  {
    id: 1,
    date: '2026-10-02',
    friday_number: 1,
    mosque_id: 1,
    mosque_name: 'বায়তুল মুকাররম জাতীয় মসজিদ',
    mosque_address: 'তোপখানা রোড, পল্টন, ঢাকা',
    mosque_maps_url: 'https://maps.google.com/?q=Baitul+Mukarram+National+Mosque',
    contact_person: 'মাওলানা মিজানুর রহমান',
    phone: '01711-223344',
    status: 'COMPLETED',
    khutbah_topic: 'ইসলামে ইনসাফ ও সামাজিক ন্যায়বিচার',
    notes: 'জুমুআ শেষে বিশেষ দোয়া মোনাজাত ও সরাসরি প্রশ্নোত্তর সম্পন্ন হয়েছে।'
  },
  {
    id: 2,
    date: '2026-10-09',
    friday_number: 2,
    mosque_id: 2,
    mosque_name: 'বাইতুল আমান জামে মসজিদ',
    mosque_address: 'রোড নং ৮, ধানমন্ডি আ/এ, ঢাকা',
    mosque_maps_url: 'https://maps.google.com/?q=Baitul+Aman+Jame+Masjid+Dhanmondi',
    contact_person: 'মুতাওয়াল্লী হাজী রফিকুল ইসলাম',
    phone: '01722-334455',
    status: 'CONFIRMED',
    khutbah_topic: 'পারিবারিক শান্তি, দাম্পত্য বোঝাপড়া ও পিতা-মাতার হক',
    notes: 'উপস্থিতির সময়: দুপুর ১২:০০ (খুতবার ৩০ মিনিট পূর্বে)। লাইভ ব্রডকাস্ট থাকবে।'
  },
  {
    id: 3,
    date: '2026-10-16',
    friday_number: 3,
    mosque_id: 3,
    mosque_name: 'সোবহানবাগ জামে মসজিদ',
    mosque_address: 'ধানমন্ডি ২৭, ঢাকা',
    mosque_maps_url: 'https://maps.google.com/?q=Sobhanbagh+Jame+Masjid',
    contact_person: 'হাফেজ কাসেম',
    phone: '01811-998877',
    status: 'CONFIRMED',
    khutbah_topic: 'যুবসমাজের চরিত্র গঠন ও সমকালীন ফেতনা থেকে সুরক্ষার উপায়',
    notes: 'নামাজের পর যুব ফোরামের সাথে সংক্ষিপ্ত মতবিনিময় মজলিস।'
  },
  {
    id: 4,
    date: '2026-10-23',
    friday_number: 4,
    mosque_id: 4,
    mosque_name: 'গুলশান সোসাইটি জামে মসজিদ',
    mosque_address: 'রোড ৬৩, গুলশান ২, ঢাকা',
    mosque_maps_url: 'https://maps.google.com/?q=Gulshan+Society+Jame+Masjid',
    contact_person: 'ইঞ্জিনিয়ার শাহাবুদ্দিন আহমেদ',
    phone: '01911-445566',
    status: 'CONFIRMED',
    khutbah_topic: 'ব্যবসা-বাণিজ্যে সততা, আমানতদারি ও হালাল উপার্জনের গুরুত্ব',
    notes: 'ইংরেজি ও বাংলা উভয় ভাষায় সংক্ষিপ্ত সারসংক্ষেপ পরিবেশন।'
  },
  {
    id: 5,
    date: '2026-10-30',
    friday_number: 5,
    mosque_id: 5,
    mosque_name: 'উত্তরা সেক্টর ৭ জামে মসজিদ',
    mosque_address: 'রোড ১, সেক্টর ৭, উত্তরা, ঢাকা',
    mosque_maps_url: 'https://maps.google.com/?q=Uttara+Sector+7+Jame+Masjid',
    contact_person: 'ড. মুস্তাফিজুর রহমান',
    phone: '01611-332211',
    status: 'CONFIRMED',
    khutbah_topic: 'কুরআনের আলোকে আদর্শ পরিবার ও ভবিষ্যৎ প্রজন্ম গড়ে তোলা',
    notes: 'মাসিক সীরাত পাঠ চক্রের উদ্বোধনী খুতবাহ।'
  }
];

// ==========================================
// 3. MOCK COURSES & SESSIONS
// ==========================================
export const initialMockCourses: Course[] = [
  {
    id: 1,
    title: 'সূরা আল-বাক্বারাহ তাফসিরুল কুরআন ধারাবাহিক',
    description: 'সূরা আল-বাক্বারাহ এর আয়াতভিত্তিক গভীর তাফসির, ব্যাকরণ ও আধুনিক জীবনের প্রয়োগ।',
    teacher_name: 'শায়খ মোখতার আহমাদ',
    target_group: 'উচ্চতর শিক্ষার্থী ও সাধারণ শ্রোতা',
    mode: 'ONLINE',
    meeting_link: 'https://zoom.us/j/987654321',
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    recurrence_rule: {
      days: ['SAT', 'MON', 'WED'],
      start_time: '21:00',
      duration_minutes: 75
    },
    default_duration_minutes: 75,
    progress_unit: 'আয়াত',
    current_progress: 'আয়াত ১৪০',
    total_units: '২৮৬ আয়াত',
    status: 'ACTIVE',
    total_sessions: 24,
    completed_sessions: 15,
    missed_sessions: 0,
    sessions: [
      {
        id: 101,
        course_id: 1,
        session_no: 14,
        date: today,
        start_time: '21:00:00',
        end_time: '22:15:00',
        status: 'PENDING',
        topic: 'তাহবীলুল কিবলা ও উম্মাতে ওয়াসাত্ব (আয়াত ১৪২-১৫০)',
        lesson_title: 'তাহবীলুল কিবলা ও মধ্যমপন্থা',
        covered_content: 'কিবলা পরিবর্তনের প্রেক্ষাপট ও মুসলিম উম্মাহর ঐতিহাসিক দায়বদ্ধতা',
        progress_value: 'আয়াত ১৫০',
        next_starting_point: 'আয়াত ১৫১',
        homework: 'আয়াত ১৫২ এর তাফসির মুতালাআ করা'
      },
      {
        id: 102,
        course_id: 1,
        session_no: 15,
        date: getRelativeDate(2),
        start_time: '21:00:00',
        end_time: '22:15:00',
        status: 'PENDING',
        topic: 'সবর ও সালাতের মাধ্যমে সাহায্য প্রার্থনা (আয়াত ১৫৩-১৫৭)',
        lesson_title: 'সবর ও সালাত'
      },
      {
        id: 103,
        course_id: 1,
        session_no: 16,
        date: getRelativeDate(4),
        start_time: '21:00:00',
        end_time: '22:15:00',
        status: 'PENDING',
        topic: 'সাফা-মারওয়া ও হালাল-হারামের বিধান (আয়াত ১৫৮-১৬৮)',
        lesson_title: 'আল্লাহর নিদর্শন ও পবিত্র খাদ্য'
      }
    ]
  },
  {
    id: 2,
    title: 'বালাগাত ও আরবি অলংকার শাস্ত্র (ইলমুল মাআনি)',
    description: 'কুরআনিক অলংকার শাস্ত্র, শব্দচয়ন ও ভাবার্থ বিশ্লেষণের মৌলিক ও উচ্চতর পাঠদান।',
    teacher_name: 'শায়খ মোখতার আহমাদ',
    target_group: 'উচ্চতর আরবি বিভাগের শিক্ষার্থী',
    mode: 'HYBRID',
    meeting_link: 'https://zoom.us/j/123456789',
    start_date: '2026-09-15',
    end_date: '2026-11-30',
    recurrence_rule: {
      days: ['SUN', 'TUE'],
      start_time: '10:30',
      duration_minutes: 90
    },
    default_duration_minutes: 90,
    progress_unit: 'অধ্যায়',
    current_progress: 'অধ্যায় ৬ (মুসনাদ ইলাইহির অবস্থা)',
    total_units: '১২ অধ্যায়',
    status: 'ACTIVE',
    total_sessions: 18,
    completed_sessions: 8,
    missed_sessions: 0,
    sessions: [
      {
        id: 201,
        course_id: 2,
        session_no: 9,
        date: tomorrow,
        start_time: '10:30:00',
        end_time: '12:00:00',
        status: 'PENDING',
        topic: 'মুসনাদ ও মুসনাদ ইলাইহির ভূমিকা ও বিলোপের রহস্য',
        lesson_title: 'আহওয়াহুল মুসনাদ ইলাইহি'
      },
      {
        id: 202,
        course_id: 2,
        session_no: 10,
        date: getRelativeDate(3),
        start_time: '10:30:00',
        end_time: '12:00:00',
        status: 'PENDING',
        topic: 'ফাসাহাত ও বালাগাতের ব্যবহারিক প্রয়োগ',
        lesson_title: 'ইলমুল বালাগাত প্রয়োগ'
      }
    ]
  },
  {
    id: 3,
    title: 'কোরআন হিফজ ও তাজবিদ পাঠদান',
    description: 'সহিহ মাখরাজ ও সিফাতসহ নিয়মতান্ত্রিক হিফজ প্রশিক্ষণ ও দোর অনুশীলন।',
    teacher_name: 'শায়খ মোখতার আহমাদ',
    target_group: 'হিফজ শিক্ষার্থী ও ইমামবৃন্দ',
    mode: 'ONLINE',
    meeting_link: 'https://zoom.us/j/555666777',
    start_date: '2026-08-01',
    end_date: '2026-12-31',
    recurrence_rule: {
      days: ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'],
      start_time: '09:00',
      duration_minutes: 60
    },
    default_duration_minutes: 60,
    progress_unit: 'পারা',
    current_progress: 'পারা ৫ (সূরা আন-নিসা)',
    total_units: '৩০ পারা',
    status: 'ACTIVE',
    total_sessions: 45,
    completed_sessions: 28,
    missed_sessions: 0,
    sessions: [
      {
        id: 301,
        course_id: 3,
        session_no: 29,
        date: today,
        start_time: '09:00:00',
        end_time: '10:00:00',
        status: 'PENDING',
        topic: 'সূরা আন-নিসা পারা ৫ তিলাওয়াত ও মাখরাজ',
        lesson_title: 'পারা ৫ হিফজ ও সুর নিরীক্ষণ'
      },
      {
        id: 302,
        course_id: 3,
        session_no: 30,
        date: tomorrow,
        start_time: '09:00:00',
        end_time: '10:00:00',
        status: 'PENDING',
        topic: 'সূরা আন-নিসা আয়াত ২৪-৩৬ ইয়াদ শুনানী',
        lesson_title: 'পারা ৫ ইয়াদ পরীক্ষা'
      }
    ]
  }
];

// ==========================================
// 4. MOCK PROGRAMMES
// ==========================================
export const initialMockProgrammes: Programme[] = [
  {
    id: 1,
    title: 'জাতীয় তাফসীরুল কুরআন ও সীরাত কনফারেন্স ২০২৬',
    programme_type: 'জাতীয় কনফারেন্স',
    date: tomorrow,
    start_time: '17:00:00',
    end_time: '19:30:00',
    venue: 'সেন্ট্রাল সেমিনার হল, কাকরাইল',
    location: 'কাকরাইল, ঢাকা',
    maps_url: 'https://maps.google.com/?q=Kakrail+Dhaka',
    topic: 'রাসূলুল্লাহ (ﷺ)-এর অনুপম জীবনদর্শন ও আদর্শ',
    audience_type: 'সুধী সমাজ, আলেমসমাজ ও সাধারণ জনতা',
    description: 'দেশের শীর্ষস্থানীয় ওলামায়ে কেরাম ও চিন্তাবিদদের উপস্থিতিতে বিশেষ সীরাত সিম্পোজিয়াম।',
    status: 'CONFIRMED',
    preparation_required: true,
    travel_required: true,
    contact_person: 'মাওলানা কামরুল হাসান',
    phone: '01711-223344',
    whatsapp: '01711-223344',
    total_prep_tasks: 3,
    completed_prep_tasks: 2
  },
  {
    id: 2,
    title: 'উম্মাহর ঐক্য ও সম্প্রীতি বিষয়ক আন্তর্জাতিক আলোচনা সভা',
    programme_type: 'আন্তর্জাতিক সিম্পোজিয়াম',
    date: getRelativeDate(8),
    start_time: '16:00:00',
    end_time: '18:30:00',
    venue: 'ইঞ্জিনিয়ার্স ইনস্টিটিউশন মিলনায়তন',
    location: 'রমনা, ঢাকা',
    maps_url: 'https://maps.google.com/?q=IEB+Ramna+Dhaka',
    topic: 'সমকালীন মুসলিম বিশ্বের চ্যালেঞ্জ ও ঐক্যবদ্ধ প্রয়াস',
    audience_type: 'বুদ্ধিজীবী, গবেষক ও শিক্ষাবিদ',
    description: 'ইসলামী গবেষক ও চিন্তাবিদদের মুক্ত মতবিনিময় সম্মেলন।',
    status: 'CONFIRMED',
    preparation_required: true,
    travel_required: true,
    contact_person: 'ড. আহমাদ রফিক',
    phone: '01722-334455',
    whatsapp: '01722-334455',
    total_prep_tasks: 2,
    completed_prep_tasks: 1
  },
  {
    id: 3,
    title: 'আন্তর্জাতিক যুব সীরাত সেমিনার ২০২৬',
    programme_type: 'যুব সম্মেলন',
    date: getRelativeDate(15),
    start_time: '15:30:00',
    end_time: '18:00:00',
    venue: 'আইইবি অডিটোরিয়াম, ঢাকা',
    location: 'রমনা, ঢাকা',
    maps_url: 'https://maps.google.com/?q=IEB+Ramna+Dhaka',
    topic: 'তরুণ প্রজন্মের নৈতিক বিকাশ ও সীরাতের অনুপ্রেরণা',
    audience_type: 'বিশ্ববিদ্যালয় ও মাদরাসা শিক্ষার্থী',
    description: 'তরুণদের নৈতিক পুনরুজ্জীবন ও ক্যারিয়ার ভাবনায় সীরাতের দিকনির্দেশনা।',
    status: 'CONFIRMED',
    preparation_required: true,
    travel_required: true,
    contact_person: 'মুহাম্মাদ ইমরান',
    phone: '01811-998877',
    whatsapp: '01811-998877',
    total_prep_tasks: 4,
    completed_prep_tasks: 1
  },
  {
    id: 4,
    title: 'ইসলামী ব্যাংকিং ও আধুনিক লেনদেন কর্মশালা',
    programme_type: 'বিশেষজ্ঞ কর্মশালা',
    date: getRelativeDate(22),
    start_time: '10:00:00',
    end_time: '13:00:00',
    venue: 'ফারস হোটেল কনফারেন্স হল',
    location: 'পল্টন, ঢাকা',
    maps_url: 'https://maps.google.com/?q=FARS+Hotel+Dhaka',
    topic: 'শরীয়াহ সম্মত আর্থিক ব্যবস্থাপনা ও আধুনিক সমাধান',
    audience_type: 'ব্যাংক কর্মকর্তা ও ব্যবসায়ী সমাজ',
    description: 'মুদারাবা, মুশারাকা ও সমকালীন ডিজিটাল লেনদেনের শারয়ী পর্যালোচনা।',
    status: 'CONFIRMED',
    preparation_required: true,
    travel_required: false,
    contact_person: 'শাহেদ মাহমুদ',
    phone: '01911-445566',
    whatsapp: '01911-445566',
    total_prep_tasks: 2,
    completed_prep_tasks: 0
  }
];

// ==========================================
// 5. MOCK ACTIVITIES (FOR CALENDAR & DASHBOARD)
// ==========================================
export const initialMockActivities: Activity[] = [
  // Today's activities
  {
    id: 1001,
    user_id: 1,
    type: 'CLASS',
    title: 'কোরআন হিফজ ও তাজবিদ পাঠদান',
    topic: 'সূরা আন-নিসা পারা ৫ তিলাওয়াত ও মাখরাজ নিরীক্ষণ',
    description: 'নিয়মিত হিফজ শিক্ষার্থীদের ইয়াদ ও সুর নিরীক্ষণ',
    date: today,
    start_time: '09:00:00',
    end_time: '10:00:00',
    location: 'অনলাইন স্টুডিও (জুম)',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: false,
    travel_required: false,
    is_private: false
  },
  {
    id: 1002,
    user_id: 1,
    type: 'MEETING',
    title: 'জাতীয় সীরাত সেমিনার আয়োজন প্রস্তুতি সভা',
    topic: 'আসন্ন সীরাত সেমিনারের অতিথি তালিকা ও প্রবন্ধ বাছাই',
    description: 'আয়োজক কমিটির সাথে কার্যনির্বাহী সমন্বয় বৈঠক',
    date: today,
    start_time: '15:00:00',
    end_time: '16:30:00',
    location: 'ইসলামিক রিসার্চ একাডেমি, ধানমন্ডি',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: true,
    travel_required: true,
    is_private: false
  },
  {
    id: 1003,
    user_id: 1,
    type: 'CLASS',
    title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #১৪',
    topic: 'আয়াত ১৩০-১৪১ তাহবীলুল কিবলা ও মধ্যমপন্থী উম্মাহ',
    description: 'উচ্চতর শিক্ষার্থীদের জন্য গভীর তাফসির ও আরবি ব্যাকরণ বিশ্লেষণ',
    date: today,
    start_time: '21:00:00',
    end_time: '22:15:00',
    location: 'অনলাইন স্টুডিও ও জুম লাইভ',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: true,
    travel_required: false,
    is_private: false
  },

  // Tomorrow's activities
  {
    id: 1004,
    user_id: 1,
    type: 'CLASS',
    title: 'বালাগাত ও আরবি অলংকার শাস্ত্র (ইলমুল মাআনি)',
    topic: 'অধ্যায় ৬: মুসনাদ ও মুসনাদ ইলাইহির ভূমিকা ও বিলোপের রহস্য',
    description: 'আরবি ভাষার আলংকারিক সৌন্দর্য ও কুরআনিক শব্দের তাৎপর্য',
    date: tomorrow,
    start_time: '10:30:00',
    end_time: '12:00:00',
    location: 'অনলাইন ক্লাসরুম',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: true,
    travel_required: false,
    is_private: false
  },
  {
    id: 1005,
    user_id: 1,
    type: 'PROGRAMME',
    title: 'জাতীয় তাফসীরুল কুরআন ও সীরাত কনফারেন্স ২০২৬',
    topic: 'রাসূলুল্লাহ (ﷺ)-এর অনুপম জীবনদর্শন ও আদর্শ',
    description: 'দেশের শীর্ষস্থানীয় ওলামায়ে কেরাম ও চিন্তাবিদদের উপস্থিতিতে বিশেষ সীরাত সিম্পোজিয়াম',
    date: tomorrow,
    start_time: '17:00:00',
    end_time: '19:30:00',
    location: 'সেন্ট্রাল সেমিনার হল, কাকরাইল, ঢাকা',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: true,
    travel_required: true,
    is_private: false
  },

  // Upcoming Days Activities
  {
    id: 1006,
    user_id: 1,
    type: 'CLASS',
    title: 'সূরা আল-বাক্বারাহ তাফসিরুল কুরআন ধারাবাহিক #১৫',
    topic: 'সবর ও সালাতের মাধ্যমে সাহায্য প্রার্থনা (আয়াত ১৫৩-১৫৭)',
    date: getRelativeDate(2),
    start_time: '21:00:00',
    end_time: '22:15:00',
    location: 'অনলাইন স্টুডিও',
    status: 'CONFIRMED',
    priority: 'MEDIUM',
    preparation_required: true,
    travel_required: false,
    is_private: false
  },
  {
    id: 1007,
    user_id: 1,
    type: 'JUMUAH',
    title: 'জুমুআতুল মুবারক খুতবাহ ও নামাজ',
    topic: 'পারিবারিক শান্তি, দাম্পত্য বোঝাপড়া ও পিতা-মাতার হক',
    description: 'বাইতুল আমান জামে মসজিদে সাপ্তাহিক খুতবাহ ও আলোচনা',
    date: '2026-10-09',
    start_time: '12:00:00',
    end_time: '14:00:00',
    location: 'বাইতুল আমান জামে মসজিদ, ধানমন্ডি',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: true,
    travel_required: true,
    is_private: false
  },
  {
    id: 1008,
    user_id: 1,
    type: 'PROGRAMME',
    title: 'উম্মাহর ঐক্য ও সম্প্রীতি বিষয়ক আন্তর্জাতিক আলোচনা সভা',
    topic: 'সমকালীন মুসলিম বিশ্বের চ্যালেঞ্জ ও ঐক্যবদ্ধ প্রয়াস',
    date: getRelativeDate(8),
    start_time: '16:00:00',
    end_time: '18:30:00',
    location: 'ইঞ্জিনিয়ার্স ইনস্টিটিউশন মিলনায়তন, রমনা, ঢাকা',
    status: 'CONFIRMED',
    priority: 'HIGH',
    preparation_required: true,
    travel_required: true,
    is_private: false
  }
];

// ==========================================
// 6. MOCK CONTACTS
// ==========================================
export const initialMockContacts = [
  {
    id: 1,
    name: 'মাওলানা কামরুল হাসান',
    designation: 'মহাসচিব',
    organization_name: 'জাতীয় সীরাত বাস্তবায়ন পরিষদ',
    phone: '01711-223344',
    whatsapp: '01711-223344',
    email: 'kamrul@seerahbd.org',
    category: 'ORGANIZER',
    city: 'ঢাকা',
    notes: 'প্রধান সমন্বয়ক ও কনফারেন্স আয়োজক'
  },
  {
    id: 2,
    name: 'মুতাওয়াল্লী হাজী রফিকুল ইসলাম',
    designation: 'সভাপতি, মসজিদ পরিচালনা কমিটি',
    organization_name: 'বাইতুল আমান জামে মসজিদ কমপ্লেক্স',
    phone: '01722-334455',
    whatsapp: '01722-334455',
    email: 'info@baitulaman.org',
    category: 'MOSQUE_COMMITTEE',
    city: 'ঢাকা',
    notes: 'নিয়মিত জুমুআ খুতবাহ সমন্বয়কারী'
  },
  {
    id: 3,
    name: 'ড. আহমাদ রফিক',
    designation: 'নির্বাহী পরিচালক',
    organization_name: 'ইসলামিক রিসার্চ একাডেমি',
    phone: '01811-998877',
    whatsapp: '01811-998877',
    email: 'rafiq@irabd.org',
    category: 'SCHOLAR',
    city: 'ঢাকা',
    notes: 'সিম্পোজিয়াম ও সেমিনার সংগঠক'
  },
  {
    id: 4,
    name: 'মুহাম্মাদ ইমরান',
    designation: 'সমন্বয়ক',
    organization_name: 'বাংলাদেশ যুব দাওয়াহ ফোরাম',
    phone: '01911-445566',
    whatsapp: '01911-445566',
    email: 'imran@youthdawah.org',
    category: 'YOUTH_LEADER',
    city: 'ঢাকা',
    notes: 'ছাত্র ও তরুণ সমাজের দাওয়াহ কর্মসূচি'
  }
];
