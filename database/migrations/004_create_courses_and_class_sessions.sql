-- Migration: 004_create_courses_and_class_sessions.sql
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    teacher_name VARCHAR(150) NOT NULL DEFAULT 'Mokhter Ahmad',
    target_group VARCHAR(150) NULL, -- e.g. 'Advanced Tajweed Group', 'Adults'
    mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL DEFAULT 'ONLINE',
    meeting_link TEXT NULL, -- Zoom/Google Meet link
    start_date DATE NOT NULL,
    end_date DATE NULL,
    recurrence_rule JSON NULL, -- e.g. {"days": ["SAT", "MON", "WED"], "start_time": "21:00", "duration_minutes": 60}
    default_duration_minutes INT UNSIGNED NOT NULL DEFAULT 60,
    syllabus TEXT NULL,
    progress_unit ENUM('Ayah', 'Page', 'Chapter', 'Lesson', 'Topic', 'Custom') NOT NULL DEFAULT 'Lesson',
    current_progress VARCHAR(100) NULL, -- e.g. 'Ayah 130' or 'Page 45'
    total_units VARCHAR(100) NULL, -- e.g. '286' (ayahs) or '100' (lessons)
    status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_course_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    activity_id BIGINT UNSIGNED NULL,
    session_no INT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM(
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'MISSED',
        'RESCHEDULED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',
    topic VARCHAR(255) NULL,
    lesson_title VARCHAR(255) NULL,
    covered_content TEXT NULL,
    progress_value VARCHAR(100) NULL,
    next_starting_point VARCHAR(255) NULL,
    homework TEXT NULL,
    teacher_notes TEXT NULL,
    student_notes TEXT NULL,
    miss_reason ENUM(
        'Personal emergency',
        'Programme conflict',
        'Teacher unavailable',
        'Student unavailable',
        'Technical issue',
        'Other'
    ) NULL,
    miss_notes TEXT NULL,
    rescheduled_to_session_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    FOREIGN KEY (rescheduled_to_session_id) REFERENCES class_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_class_session_date (date),
    INDEX idx_class_session_status (status),
    INDEX idx_class_course_date (course_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
