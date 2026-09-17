-- Migration: 005_create_jumua_and_programmes.sql
CREATE TABLE IF NOT EXISTS jumua_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    friday_number INT UNSIGNED NULL, -- 1 to 5 within month, or week of year
    mosque_id BIGINT UNSIGNED NULL,
    contact_person VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    invitation_source VARCHAR(150) NULL,
    status ENUM('FREE', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'FREE',
    khutbah_topic VARCHAR(255) NULL,
    notes TEXT NULL,
    preparation_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'READY') DEFAULT 'NOT_STARTED',
    travel_plan_id BIGINT UNSIGNED NULL,
    cancellation_reason TEXT NULL,
    activity_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mosque_id) REFERENCES mosques(id) ON DELETE SET NULL,
    FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uq_jumua_date (date),
    INDEX idx_jumua_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programmes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    programme_type ENUM('Lecture', 'Mahfil', 'Seminar', 'Conference', 'Discussion', 'Workshop', 'Other') NOT NULL DEFAULT 'Lecture',
    date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    venue VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    maps_url TEXT NULL,
    organizer_id BIGINT UNSIGNED NULL,
    contact_person VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    whatsapp VARCHAR(50) NULL,
    topic VARCHAR(255) NULL,
    audience_type VARCHAR(150) NULL, -- e.g. 'General Public', 'Scholars', 'Youth', 'Students'
    description TEXT NULL,
    status ENUM(
        'DRAFT',
        'INVITED',
        'PENDING',
        'CONFIRMED',
        'RESCHEDULED',
        'CANCELLED',
        'COMPLETED'
    ) NOT NULL DEFAULT 'PENDING',
    preparation_required TINYINT(1) DEFAULT 1,
    travel_required TINYINT(1) DEFAULT 1,
    notes TEXT NULL,
    activity_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_programme_date (date),
    INDEX idx_programme_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programme_preparations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    programme_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
    due_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE,
    INDEX idx_prep_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
