-- Seed: 001_initial_seed.sql

-- 1. Insert Roles
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'owner', 'Scholar / Owner', 'Full control over all personal, scholarly, and administrative data'),
(2, 'ps_admin', 'Personal Secretary (PS)', 'Operational management of public schedule, programmes, and classes without access to private items')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- 2. Insert Standard Permissions
INSERT INTO permissions (id, name, display_name, module) VALUES
(1, 'activity.view', 'View Activities', 'activity'),
(2, 'activity.create', 'Create Activities', 'activity'),
(3, 'activity.edit', 'Edit Activities', 'activity'),
(4, 'activity.delete', 'Delete Activities', 'activity'),
(5, 'programme.view', 'View Programmes', 'programme'),
(6, 'programme.create', 'Create Programmes', 'programme'),
(7, 'programme.edit', 'Edit Programmes', 'programme'),
(8, 'programme.confirm', 'Confirm / Reschedule Programmes', 'programme'),
(9, 'programme.delete', 'Delete Programmes', 'programme'),
(10, 'course.view', 'View Courses & Classes', 'course'),
(11, 'course.create', 'Create Courses', 'course'),
(12, 'course.edit', 'Edit Courses & Sessions', 'course'),
(13, 'course.delete', 'Delete Courses', 'course'),
(14, 'jumua.view', 'View Jumuah Schedule', 'jumua'),
(15, 'jumua.manage', 'Manage Jumuah Schedule', 'jumua'),
(16, 'contact.view', 'View Contacts & Mosques', 'contact'),
(17, 'contact.manage', 'Manage Contacts & Mosques', 'contact'),
(18, 'task.manage', 'Manage Tasks & Follow-ups', 'task'),
(19, 'audit.view', 'View Audit Logs', 'audit'),
(20, 'private_data.view', 'View Private Personal Data', 'privacy'),
(21, 'settings.manage', 'Manage System Settings', 'settings'),
(22, 'user.manage', 'Manage System Users', 'user')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- 3. Assign Permissions
-- Owner gets all permissions (1..22)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- PS / Admin gets operational permissions (excludes 19, 20, 21, 22)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE id NOT IN (19, 20, 21, 22);

-- 4. Insert Default Users
-- Default password: password123
INSERT INTO users (id, role_id, name, email, phone, password_hash, status) VALUES
(1, 1, 'Mokhter Ahmad', 'admin@mokhterahmad.com', '+8801700000000', '$2y$12$xgSZi17L3D6eHUB4VHptKuUwhqWDCXyW4I7obthfGRFqrkECiGHii', 'ACTIVE'),
(2, 2, 'Personal Secretary', 'ps@mokhterahmad.com', '+8801800000000', '$2y$12$xgSZi17L3D6eHUB4VHptKuUwhqWDCXyW4I7obthfGRFqrkECiGHii', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Insert Sample Mosques
INSERT INTO mosques (id, name, address, district, contact_person, phone, notes) VALUES
(1, 'Baitul Mukarram National Mosque', 'Topkhana Road, Paltan', 'Dhaka', 'Khatib Committee Sec.', '+8801711111111', 'Central national mosque'),
(2, 'Sobhanbagh Jame Masjid', 'Dhanmondi 27, Mirpur Road', 'Dhaka', 'Mutawalli Haji Sahab', '+8801722222222', 'Regular Friday prayer invitations'),
(3, 'Gulshan Society Jame Masjid', 'Road 63, Gulshan 2', 'Dhaka', 'President Committee', '+8801733333333', 'Good audio and multimedia system'),
(4, 'Uttara Sector 7 Jame Masjid', 'Road 1, Sector 7, Uttara', 'Dhaka', 'General Secretary', '+8801744444444', 'Spacious arrangements')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Insert Sample Organization
INSERT INTO organizations (id, name, type, contact_person, phone, address) VALUES
(1, 'Al-Quran Academy Foundation', 'Foundation', 'Director Administration', '+8801911111111', 'Lalmatia, Dhaka'),
(2, 'Islamic Research Center', 'Research Institute', 'Coordinator', '+8801922222222', 'Bashundhara R/A, Dhaka')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. Insert Sample Course
INSERT INTO courses (id, title, description, teacher_name, target_group, mode, start_date, recurrence_rule, default_duration_minutes, progress_unit, current_progress, total_units, status, created_by) VALUES
(1, 'Tafsir of Surah Al-Baqarah', 'Comprehensive Tafsir, linguistics and practical life lessons from Surah Al-Baqarah.', 'Mokhter Ahmad', 'Advanced Students', 'ONLINE', '2026-09-01', '{"days":["SAT","MON","WED"],"start_time":"21:00","duration_minutes":60}', 60, 'Ayah', 'Ayah 125', '286', 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);
