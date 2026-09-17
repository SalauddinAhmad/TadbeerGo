# Personal Life Management & Digital Assistant Web App

## 1. Project Overview

This project is a lightweight, production-ready **Personal Life & Engagement Management Web App** designed primarily for a teacher, scholar, khatib, lecturer, and programme speaker who needs to manage classes, Jumu'ah/Khutbah commitments, lectures, programmes, meetings, travel, preparation, contacts, reminders, and a personal assistant/PS workflow from one place.

This is **not a conventional calendar application**.

The application should function as a personal digital management system combining:

- Personal calendar
- Daily agenda
- Recurring online course/class management
- Class history and teaching progress
- Jumu'ah / Khutbah planner
- Lecture and programme diary
- Programme preparation management
- Travel planning
- Reminder and notification system
- Contact and organization management
- Follow-up management
- PS/Admin collaboration
- Activity history / audit log
- PWA installation and mobile-friendly usage
- Future-ready AI assistant architecture

The first version must be optimized for **Lite / Shared Hosting / cPanel / LiteSpeed / Apache**.

---

# 2. Core Technical Principle

The application must be:

- Lightweight
- Fast
- Simple
- Secure
- Maintainable
- Modular
- Shared-hosting compatible
- PWA-ready
- API-driven
- Mobile responsive
- Easy to deploy through cPanel
- Easy to migrate to VPS/cloud later

## Important Architectural Constraint

Do **NOT** use:

- Laravel
- Node.js backend server
- Next.js server
- Docker
- Redis
- Microservices
- Kubernetes
- Required VPS-only infrastructure
- Any backend dependency that requires a persistent Node process

The application must work on ordinary shared hosting with:

- PHP 8.2+
- MySQL 8+ or MariaDB
- Apache/LiteSpeed
- HTTPS
- cPanel
- Cron Jobs

---

# 3. Recommended Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui-style component architecture
- React Router
- TanStack Query
- React Hook Form
- Zod
- FullCalendar
- Lucide Icons
- date-fns

## Backend

- Core PHP 8.2+
- REST API
- PDO
- PHP Sessions
- Password hashing using `password_hash()`
- CSRF protection where applicable
- Custom lightweight service/repository architecture

## Database

- MySQL 8+
- MariaDB compatible
- UTF-8 using `utf8mb4`
- InnoDB

## PWA

- Web App Manifest
- Service Worker
- Cache strategy
- Installable mobile experience
- Push notification support where browser/device permits

## Scheduled Processing

- cPanel Cron
- PHP CLI or HTTP-triggered cron endpoint depending on hosting capability

Recommended target:

```text
Every 5 minutes
```

## Optional External Services

- Google Maps / Maps URLs
- Web Push
- SMTP / transactional email
- WhatsApp deep links
- Future AI API

External services must remain optional and must not prevent the core application from functioning.

---

# 4. High-Level Architecture

```text
                    USER / PS
                       |
             Browser / Installed PWA
                       |
              React + Vite Frontend
                       |
                  HTTPS REST API
                       |
              Core PHP API Backend
                       |
        +--------------+--------------+
        |              |              |
   Auth/RBAC       Business Logic   Notifications
        |              |              |
        +--------------+--------------+
                       |
                 MySQL / MariaDB
                       |
                 cPanel Cron
                       |
              Reminder Processing
```

The backend should be organized as a **modular monolith**, not microservices.

---

# 5. Main Product Modules

The application must contain the following primary modules:

1. Dashboard
2. Activities
3. Calendar
4. Courses
5. Class Sessions
6. Jumu'ah / Khutbah
7. Mosques
8. Programmes
9. Programme Preparation
10. Travel
11. Tasks
12. Contacts
13. Organizations
14. Reminders
15. Notifications
16. Follow-ups
17. Attachments
18. Search
19. Reports / Overview
20. PS/Admin Management
21. Audit Logs
22. Settings
23. Profile

---

# 6. Design Philosophy

The UI must be:

- Minimal
- Clean
- Professional
- Calm
- Spacious
- Fast to scan
- Mobile-first
- Low visual noise

Avoid:

- Excessive cards
- Excessive colors
- Large gradients
- Unnecessary animations
- Decorative UI that reduces usability
- Dense ERP-style layouts
- Overly complicated navigation

The user should understand the most important information within approximately **5–10 seconds** after opening the dashboard.

---

# 7. Primary Navigation

Recommended navigation:

```text
Dashboard
Calendar
Classes
Jumu'ah
Programmes
Contacts
Tasks
Notifications
Settings
```

On mobile, use a compact bottom navigation:

```text
Home
Calendar
Classes
Programmes
More
```

A persistent primary action should be available:

```text
+ Add Activity
```

---

# 8. Dashboard

The Dashboard is the most important screen.

It should answer:

- What do I have now?
- What is next?
- What do I have today?
- Where do I need to go?
- What needs preparation?
- What is pending?
- Are there conflicts?
- What needs my attention?

## Dashboard Structure

```text
Good Morning
Wednesday, 9 September

NOW
[Current Activity]

NEXT
[Next Activity]

TODAY
10:00 AM  Qur'an Class
01:30 PM  Meeting
05:00 PM  Travel
07:30 PM  Lecture

NEEDS ATTENTION
2 programmes need preparation
3 invitations awaiting confirmation

UPCOMING
Tomorrow
Friday
This Weekend
```

## Dashboard Widgets

- Current activity
- Next activity
- Today's timeline
- Upcoming activities
- Classes today
- Programmes today
- Upcoming Jumu'ah
- Pending confirmations
- Preparation tasks
- Follow-ups
- Schedule conflicts
- Quick actions

---

# 9. Unified Activity System

Everything should be represented as an Activity.

## Activity Types

```text
CLASS
JUMUAH
KHUTBAH
LECTURE
PROGRAMME
MEETING
TRAVEL
PERSONAL
TASK
PREPARATION
OTHER
```

## Common Activity Fields

- ID
- Type
- Title
- Description
- Date
- Start time
- End time
- Timezone
- Location
- Latitude
- Longitude
- Contact
- Organization
- Topic
- Notes
- Status
- Priority
- Preparation required
- Travel required
- Source
- Created by
- Updated by
- Created at
- Updated at

---

# 10. Activity Status

Supported statuses:

```text
DRAFT
PENDING
CONFIRMED
IN_PROGRESS
COMPLETED
MISSED
RESCHEDULED
CANCELLED
```

Status transitions must be tracked.

Example:

```text
Pending
   ↓
Confirmed
   ↓
Completed
```

Alternative:

```text
Pending
   ↓
Cancelled
```

Or:

```text
Confirmed
   ↓
Rescheduled
   ↓
Confirmed
```

---

# 11. Calendar

The calendar must support:

- Day
- Week
- Month
- Year / annual overview

Use FullCalendar on the frontend.

## Calendar Filters

Filter by:

- All
- Classes
- Jumu'ah
- Programmes
- Meetings
- Travel
- Tasks
- Personal

Use visual differentiation, but keep the color palette restrained.

---

# 12. Course Management

Courses are different from individual class sessions.

Example courses:

- Surah Al-Baqarah
- Qur'an Hifz
- Balaghah & Fasaahah
- Tafsir
- Arabic
- Other online courses

## Course Fields

- Course name
- Description
- Teacher
- Students/group
- Mode
- Start date
- End date
- Schedule
- Default duration
- Syllabus
- Current progress
- Status
- Notes

---

# 13. Recurring Class Engine

A course can have recurring classes.

Examples:

```text
Saturday + Monday + Wednesday
```

or:

```text
Every day
```

or:

```text
Sunday + Tuesday
```

The recurrence system must support:

- Weekly
- Daily
- Selected weekdays
- Start date
- End date
- Optional yearly horizon
- Time
- Duration
- Exceptions
- Cancelled occurrence
- Rescheduled occurrence

Do not store only a recurring rule and render everything dynamically forever.

Use a robust approach:

1. Store recurrence definition.
2. Generate class instances for a configurable horizon.
3. Store each generated class session independently.
4. Preserve exceptions and history.

For example:

```text
Course
  |
  +-- Recurrence Rule
  |
  +-- Class #001
  +-- Class #002
  +-- Class #003
  +-- ...
```

---

# 14. Class Session

Every individual class must have its own record.

## Fields

- Course ID
- Session number
- Date
- Start time
- End time
- Status
- Topic
- Lesson
- Covered content
- Progress
- Student notes
- Teacher notes
- Next starting point
- Homework
- Attachments
- Miss reason
- Reschedule reference
- Created by
- Updated by

---

# 15. Class History

A completed class should store:

```text
Class #47
Date: 12 September
Status: Completed

Covered:
- Surah Al-Baqarah
- Ayah 120–130
- Tafsir
- Vocabulary

Notes:
...

Next class:
Start from Ayah 131
```

This information must remain searchable.

---

# 16. Missed Class

If a class is missed:

```text
Status = MISSED
```

Allow a reason:

```text
Personal emergency
Programme conflict
Teacher unavailable
Student unavailable
Technical issue
Other
```

Allow a custom note.

Then optionally:

```text
Reschedule
```

The original missed session must remain in history.

Do not overwrite it.

---

# 17. Rescheduling

When rescheduling:

- Preserve original date/time.
- Mark original occurrence as `RESCHEDULED` or `MISSED`, depending on workflow.
- Create or associate a new session.
- Link original session and new session.
- Preserve reason.
- Record who performed the change.

Example:

```text
Original:
12 Sep 9:00 PM

Rescheduled:
15 Sep 9:00 PM
```

---

# 18. Course Progress

Course progress should support both:

### Session progress

```text
71 / 96 classes completed
```

and optionally:

### Syllabus/content progress

Example:

```text
Surah Al-Baqarah
Current Ayah: 183
Next Ayah: 184
```

The system must allow flexible progress tracking because different courses may use different units.

Possible progress unit types:

- Ayah
- Page
- Chapter
- Lesson
- Topic
- Custom

---

# 19. Jumu'ah / Khutbah Module

This must be a dedicated module.

## Jumu'ah Record

Fields:

- Date
- Friday number
- Mosque
- Location
- Contact person
- Phone
- Reference person
- Invitation source
- Contact date
- Confirmation date
- Status
- Khutbah topic
- Notes
- Preparation status
- Travel plan
- Reminder
- Cancellation reason
- Reschedule information

## Status

```text
FREE
PENDING
CONFIRMED
COMPLETED
CANCELLED
```

---

# 20. Jumu'ah Monthly Overview

Example:

```text
September 2026

04 Sep   Masjid A      Confirmed
11 Sep   Masjid B      Pending
18 Sep   —             Free
25 Sep   Masjid C      Confirmed
```

The overview should make free Fridays immediately visible.

---

# 21. Mosque Database

A mosque should be reusable.

## Mosque Fields

- Mosque name
- Address
- Google Maps location
- Contact person
- Phone
- WhatsApp
- Email
- Reference
- Notes
- Previous invitations
- Previous Jumu'ah events

Do not duplicate the same mosque record for every event.

---

# 22. Programme Management

Programme records should support:

- Programme title
- Type
- Date
- Time
- Venue
- Location
- Organizer
- Contact person
- Phone
- WhatsApp
- Topic
- Audience
- Description
- Confirmation status
- Cancellation status
- Preparation
- Travel
- Notes
- Attachments
- Follow-up
- Reminders

---

# 23. Programme Status

Recommended:

```text
DRAFT
INVITED
PENDING
CONFIRMED
RESCHEDULED
CANCELLED
COMPLETED
```

---

# 24. Programme Preparation

Every programme can have preparation items.

Example:

```text
Preparation

[ ] Topic research
[ ] Speech outline
[ ] Quran references
[ ] Hadith references
[ ] Slides
[ ] Documents
[ ] Confirm with organizer
[ ] Travel arrangement
```

Preparation tasks should have:

- Title
- Description
- Due date
- Priority
- Status
- Assignee
- Completion timestamp

---

# 25. Travel Management

Travel should be optionally attached to an activity.

Fields:

- Origin
- Destination
- Travel mode
- Estimated duration
- Buffer time
- Leave-by time
- Notes
- Map URL

Travel modes:

```text
Car
Bike
Ride share
Public transport
Walking
Other
```

The system should calculate:

```text
Programme Start
-
Travel Duration
-
Buffer
=
Recommended Leave Time
```

Example:

```text
Programme: 7:30 PM
Travel: 55 min
Buffer: 15 min

Leave by: 6:20 PM
```

---

# 26. Conflict Detection

The system must detect:

### Time conflict

Two activities overlap.

### Travel conflict

Two activities are technically non-overlapping but travel time makes them unrealistic.

Example:

```text
6:00 PM — Mirpur
6:30 PM — Gulshan
```

If the configured travel time is insufficient:

```text
Warning:
Possible travel conflict.
```

Conflict detection should be a warning, not an automatic cancellation.

---

# 27. Reminder System

Every activity may have multiple reminders.

Examples:

```text
1 week before
3 days before
1 day before
12 hours before
3 hours before
1 hour before
30 minutes before
15 minutes before
Custom
```

Multiple reminders are allowed.

Example:

```text
Lecture
8:00 PM

Reminder:
1 day before
3 hours before
30 minutes before
```

---

# 28. Reminder Architecture

Store reminders separately.

Example:

```text
activity_reminders

id
activity_id
offset_type
offset_value
scheduled_at
channel
status
sent_at
error_message
```

Channels:

```text
PUSH
EMAIL
IN_APP
```

Optional future:

```text
SMS
WHATSAPP
```

---

# 29. Cron-Based Reminder Processing

Because the application must run on shared hosting, use cPanel Cron.

Recommended:

```text
*/5 * * * *
```

The cron should execute a PHP command or secure cron endpoint.

Flow:

```text
cPanel Cron
    ↓
Reminder Processor
    ↓
Find due reminders
    ↓
Lock/process each reminder
    ↓
Send notification
    ↓
Mark as sent
```

Important:

- Avoid duplicate sending.
- Use idempotent processing.
- Store notification status.
- Use locking where possible.
- Log failures.

---

# 30. Notifications

## In-App

Show:

- Upcoming activity
- Reminder
- Programme confirmation
- Reschedule
- Cancellation
- Follow-up
- Class reminder
- Preparation due

## Push

Use Web Push where supported.

Push permission must be optional.

The application must remain usable even if the user denies push permission.

## Email

Email notification should be optional.

---

# 31. PS / Admin System

There must be role-based access control.

## Roles

### OWNER

Full access.

### PS / ADMIN

Operational access.

Future roles can be added:

```text
ASSISTANT
EDITOR
VIEWER
```

---

# 32. Owner Permissions

Owner can:

- View everything
- Create
- Edit
- Delete
- Confirm
- Cancel
- Reschedule
- Manage courses
- Manage Jumu'ah
- Manage programmes
- Manage contacts
- Manage users
- Manage permissions
- View audit logs
- Manage private notes

---

# 33. PS/Admin Permissions

PS should be able to:

- Add programme
- Add class
- Add meeting
- Update invitation
- Update confirmation
- Add organizer
- Add contact
- Follow up
- Reschedule
- Cancel
- Add preparation items
- Add notes
- View assigned information

But PS must NOT automatically have access to private information.

---

# 34. Private Data

Some fields may be marked:

```text
PRIVATE
```

Examples:

- Personal notes
- Sensitive personal tasks
- Private financial notes
- Private contact notes

The API must enforce privacy server-side.

Hiding a field only in React is NOT sufficient.

---

# 35. Audit Log

Every important change should be logged.

Examples:

```text
8 Sep, 4:32 PM
PS changed status:
Pending → Confirmed
```

```text
8 Sep, 5:10 PM
Programme rescheduled:
18 Sep → 19 Sep
```

Audit fields:

- User
- Action
- Entity type
- Entity ID
- Previous value
- New value
- Timestamp
- IP where appropriate
- User agent where appropriate

Do not log passwords, tokens, or sensitive authentication secrets.

---

# 36. Contacts

Contacts should be reusable.

Fields:

- Name
- Role
- Organization
- Phone
- WhatsApp
- Email
- Notes
- Tags
- Preferred contact method

Examples:

```text
Organizer
Imam
Mosque representative
Course coordinator
University representative
Driver
Other
```

---

# 37. Organizations

Organization fields:

- Name
- Type
- Address
- Website
- Phone
- Email
- Notes

Types:

```text
Mosque
Madrasa
University
Foundation
Islamic Organization
Event Organizer
Online Platform
Other
```

---

# 38. Follow-Up System

The PS needs a simple follow-up workflow.

Example:

```text
Invitation received
      ↓
Contact organizer
      ↓
Waiting for confirmation
      ↓
Follow-up due
      ↓
Confirmed
```

Follow-up fields:

- Related programme
- Contact
- Due date
- Method
- Notes
- Status
- Assigned to

Statuses:

```text
PENDING
DONE
SKIPPED
CANCELLED
```

---

# 39. Search

Global search must cover:

- Activities
- Classes
- Courses
- Jumu'ah
- Mosques
- Programmes
- Contacts
- Organizations
- Notes

Search should support partial text.

Examples:

```text
Surah Baqarah
Masjid Umar
Balaghah
September
Abdul Rahman
```

---

# 40. Filters

Use filters on relevant screens.

Common filters:

- Date range
- Status
- Type
- Course
- Mosque
- Organization
- Contact
- Assigned person
- Priority

---

# 41. Reports / Overview

Optional but recommended.

## Monthly Summary

Show:

- Total classes
- Completed classes
- Missed classes
- Rescheduled classes
- Programmes
- Jumu'ah commitments
- Cancelled programmes
- Pending invitations
- Preparation tasks
- Completed tasks

## Course Summary

```text
Course
Total Sessions
Completed
Missed
Rescheduled
Progress
```

---

# 42. Database Design

Recommended tables:

```text
users
roles
permissions
role_permissions

contacts
organizations
mosques
locations

activities
activity_reminders
activity_notes
activity_status_history

courses
course_schedules
class_sessions
class_progress
class_notes

jumua_events

programmes
programme_preparation

travel_plans

tasks
follow_ups

notifications
notification_logs

attachments

audit_logs

settings
user_preferences
push_subscriptions
```

---

# 43. Database Relationship Overview

```text
USER
 |
 +---- ACTIVITIES
 |       |
 |       +---- REMINDERS
 |       +---- NOTES
 |       +---- STATUS HISTORY
 |       +---- TRAVEL
 |
 +---- COURSES
 |       |
 |       +---- COURSE SCHEDULE
 |       +---- CLASS SESSIONS
 |                |
 |                +---- CLASS NOTES
 |                +---- CLASS PROGRESS
 |
 +---- PROGRAMMES
 |       |
 |       +---- PREPARATION
 |       +---- TRAVEL
 |       +---- FOLLOW-UPS
 |
 +---- JUMUA EVENTS
 |       |
 |       +---- MOSQUE
 |
 +---- CONTACTS
 |
 +---- AUDIT LOGS
```

---

# 44. Suggested SQL Principles

Use:

```sql
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
```

All primary keys should preferably use BIGINT UNSIGNED or another consistent ID strategy.

Use foreign keys where appropriate.

Create indexes for:

- activity date
- activity status
- activity type
- course ID
- class session date
- programme date
- Jumu'ah date
- reminder scheduled time
- notification status
- contact name
- organization name

---

# 45. API Architecture

The backend should expose REST-style endpoints.

Example:

```text
/api/auth/login
/api/auth/logout
/api/auth/me

/api/dashboard

/api/activities
/api/activities/{id}

/api/calendar

/api/courses
/api/courses/{id}

/api/courses/{id}/sessions
/api/class-sessions/{id}

/api/jumua
/api/jumua/{id}

/api/mosques
/api/mosques/{id}

/api/programmes
/api/programmes/{id}

/api/contacts
/api/contacts/{id}

/api/organizations
/api/tasks
/api/follow-ups

/api/reminders
/api/notifications

/api/settings
```

---

# 46. API Rules

Every protected endpoint must:

1. Validate session/authentication.
2. Validate authorization.
3. Validate request data.
4. Perform business logic.
5. Return consistent JSON.
6. Log important changes.
7. Never expose internal database errors to users.

Example success:

```json
{
  "success": true,
  "data": {}
}
```

Example error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date."
  }
}
```

---

# 47. Authentication

Use secure PHP sessions.

Password storage:

```php
password_hash($password, PASSWORD_DEFAULT);
```

Verification:

```php
password_verify($password, $hash);
```

Requirements:

- Secure cookies
- HttpOnly
- SameSite
- HTTPS
- Session regeneration after login
- Logout invalidation
- Rate limiting
- Login attempt protection
- Password reset flow

Never store plaintext passwords.

---

# 48. Authorization

Permissions must be checked on the server.

Example:

```text
programme.view
programme.create
programme.edit
programme.delete
programme.confirm
programme.cancel

course.view
course.create
course.edit
course.delete

jumua.view
jumua.create
jumua.edit

user.manage
audit.view
private_data.view
```

Frontend permissions are only for UI convenience.

Backend remains authoritative.

---

# 49. Security Requirements

Must implement:

- HTTPS
- Prepared SQL statements
- PDO
- CSRF protection
- XSS protection
- Output escaping
- Session security
- Rate limiting
- Authentication throttling
- Secure file upload validation
- MIME/type validation
- File size limits
- Access control
- Audit logging
- Secure error handling
- Environment/config separation

Never build SQL using direct string concatenation from user input.

---

# 50. File Upload Security

Allowed file types should be configurable.

Prefer:

```text
PDF
JPG
JPEG
PNG
WEBP
DOCX
XLSX
```

Do not allow arbitrary executable uploads.

Uploaded files should be stored outside executable PHP directories where possible.

Generate safe server-side filenames.

---

# 51. Frontend Folder Structure

Recommended:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── activities/
│   │   ├── calendar/
│   │   ├── courses/
│   │   ├── classes/
│   │   ├── jumua/
│   │   ├── programmes/
│   │   ├── contacts/
│   │   ├── tasks/
│   │   └── notifications/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── styles/
├── public/
├── index.html
├── package.json
└── vite.config.ts
```

---

# 52. Backend Folder Structure

Use a lightweight custom architecture.

```text
api/
├── public/
│   └── index.php
├── config/
│   ├── config.php
│   └── database.php
├── routes/
│   └── api.php
├── controllers/
├── services/
├── repositories/
├── models/
├── middleware/
├── validators/
├── helpers/
├── cron/
├── storage/
│   ├── uploads/
│   └── logs/
└── bootstrap/
```

Do not turn Core PHP into an unstructured collection of hundreds of PHP files.

Keep:

```text
Route
→ Middleware
→ Controller
→ Service
→ Repository
→ Database
```

---

# 53. Business Logic Separation

Controllers should remain thin.

Bad:

```text
Controller
  → SQL
  → recurrence calculation
  → notification logic
  → permission logic
```

Good:

```text
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

Example:

```text
ProgrammeController
      ↓
ProgrammeService
      ↓
ProgrammeRepository
```

---

# 54. Recurrence Logic

Recurring class generation must be deterministic.

Inputs:

```text
start_date
end_date
weekdays
start_time
duration
timezone
```

The engine generates occurrences.

Important edge cases:

- Month boundaries
- Year boundaries
- Leap years
- Daylight saving where relevant
- Date format
- Timezone
- Cancelled occurrence
- Rescheduled occurrence
- Duplicate generation

For Bangladesh-focused usage, default timezone should be:

```text
Asia/Dhaka
```

But timezone should remain configurable per user.

---

# 55. Timezone Handling

Store timestamps consistently.

Recommended:

- Store database timestamps in UTC where appropriate.
- Store event-local date/time separately when needed.
- Store user timezone.
- Convert to display timezone in frontend.

Default:

```text
Asia/Dhaka
```

Never rely on the server's timezone implicitly.

---

# 56. PWA Requirements

The application must include:

```text
manifest.webmanifest
service-worker.js
icons
offline fallback
```

Manifest should include:

- App name
- Short name
- Theme color
- Background color
- Start URL
- Display: standalone
- Icons

The PWA should be installable from supported browsers.

---

# 57. Offline Strategy

Version 1 does not need full offline database synchronization.

However, cache:

- App shell
- Static assets
- Basic UI resources

When offline:

```text
You are offline.
Some features may be unavailable.
```

Do not silently lose user-entered data.

If offline form creation is implemented later, use IndexedDB and a sync queue.

---

# 58. Notification Reality on Shared Hosting

Web Push is browser-dependent.

The application should not assume push notifications are guaranteed on every browser/device.

Therefore provide:

1. In-app reminders
2. Browser push where supported
3. Optional email
4. Optional future SMS/WhatsApp integration

The reminder engine must remain independent of the delivery channel.

---

# 59. Cron Jobs

Recommended jobs:

```text
Every 5 minutes
→ Process due reminders

Every 15 minutes
→ Process pending follow-ups if needed

Daily
→ Generate upcoming recurring sessions

Daily
→ Cleanup temporary data

Weekly
→ Maintenance / statistics tasks
```

Do not create unnecessary high-frequency cron jobs.

---

# 60. cPanel Deployment

Typical deployment:

```text
GitHub
   ↓
Build frontend
   ↓
Upload frontend dist/
   ↓
Upload PHP API
   ↓
Create MySQL database
   ↓
Configure environment
   ↓
Run database migrations
   ↓
Configure .htaccess
   ↓
Enable SSL
   ↓
Configure Cron
```

The frontend may be deployed to:

```text
public_html/
```

The API may be:

```text
public_html/api/
```

or preferably a protected backend location with a public entry point.

Exact deployment depends on hosting configuration.

---

# 61. Environment Configuration

Do not hardcode secrets.

Use environment/config values for:

```text
DB_HOST
DB_NAME
DB_USER
DB_PASSWORD

APP_URL
APP_ENV

MAIL_HOST
MAIL_USER
MAIL_PASSWORD

GOOGLE_MAPS_KEY
PUSH_PUBLIC_KEY
PUSH_PRIVATE_KEY
```

Secrets must not be committed to GitHub.

Provide:

```text
.env.example
```

but never commit real `.env`.

---

# 62. Performance Requirements

The application should remain fast on shared hosting.

Target:

- Minimal JavaScript bundle
- Code splitting
- Lazy loading
- Optimized images
- Database indexes
- Pagination
- Server-side filtering
- Avoid N+1 queries
- Avoid loading entire year of events at once
- Cache suitable static/config data
- Efficient recurring-event generation

Calendar should fetch only the visible date range where practical.

---

# 63. Mobile UX

Mobile must be treated as a first-class interface.

Important actions should be easy with one hand.

Use:

- Large touch targets
- Bottom navigation
- Floating/add action
- Swipe-friendly calendar where appropriate
- Compact forms
- Sticky save buttons where useful
- Avoid giant tables on mobile

---

# 64. Quick Add

The user should be able to create common activities quickly.

Examples:

```text
+ Class
+ Jumu'ah
+ Programme
+ Meeting
+ Travel
+ Task
```

Quick Add should prefill relevant fields.

---

# 65. Smart Defaults

Examples:

If creating a Class:

```text
Type = Class
```

If creating Jumu'ah:

```text
Type = Jumu'ah
Date = next Friday
```

If creating a Programme:

```text
Preparation section available
Travel section available
Contact section available
```

Defaults must be editable.

---

# 66. Upcoming View

Create a unified upcoming screen.

Example:

```text
TODAY
10:00 Class

TOMORROW
5:00 PM Programme

FRIDAY
1:00 PM Jumu'ah

SATURDAY
9:00 PM Qur'an Class
```

This should not require opening the full calendar.

---

# 67. "Now / Next" Logic

The Dashboard should determine:

```text
Current Activity
Next Activity
```

If no activity is currently active:

```text
No current activity
Next: ...
```

If there is no upcoming activity:

```text
No scheduled activity
```

---

# 68. Preparation Indicator

Upcoming programmes/classes should show:

```text
Preparation:
Complete
In progress
Not started
Overdue
```

Use subtle indicators.

Example:

```text
Lecture
Tomorrow, 7:30 PM
Preparation: 3/5 complete
```

---

# 69. Confirmation Indicator

Programme cards should clearly show:

```text
Pending
Confirmed
Cancelled
Rescheduled
```

Jumu'ah monthly view should especially emphasize confirmation status.

---

# 70. Data Integrity Rules

Examples:

- A cancelled activity cannot be marked completed without explicit override.
- A rescheduled event must retain original history.
- A deleted course should not silently delete historical class records.
- Completed class history should not be overwritten.
- Contact deletion should be prevented if referenced, or handled via soft delete.
- Mosque records should be reusable.
- Audit history should be immutable to ordinary users.

Prefer soft deletion for important business entities.

---

# 71. Soft Delete

Use fields such as:

```text
deleted_at
deleted_by
```

for important records.

Avoid permanently deleting:

- Completed classes
- Jumu'ah history
- Programme history
- Audit logs

unless an explicit administrative data-retention process exists.

---

# 72. Backup

Shared hosting database backup must be configured.

Minimum:

- Daily database backup
- Weekly retained backup
- File backup
- Backup verification

Never assume cPanel hosting backups are sufficient.

The application should document how to restore:

```text
Database
Files
Environment/configuration
```

---

# 73. Error Logging

Log backend errors to a non-public location.

Log:

- Timestamp
- Endpoint
- User ID where appropriate
- Error code
- Exception type
- Safe message

Do not expose stack traces to production users.

---

# 74. Testing

At minimum test:

## Authentication

- Login
- Logout
- Wrong password
- Session expiry
- Password reset

## Activities

- Create
- Edit
- Delete/archive
- Status changes
- Conflict detection

## Classes

- Recurrence
- Generation
- Missed class
- Reschedule
- History
- Progress

## Jumu'ah

- Monthly overview
- Free Friday
- Pending
- Confirmed
- Cancelled

## Programmes

- Create
- Confirmation
- Preparation
- Travel
- Reschedule
- Cancellation

## Permissions

- Owner
- PS
- Private information

## Notifications

- Reminder scheduling
- Duplicate prevention
- Failed delivery
- Sent status

---

# 75. Seed Data

Development mode should include optional demo data.

Example:

```text
Courses:
Surah Al-Baqarah
Qur'an Hifz
Balaghah & Fasaahah

Activities:
Class
Meeting
Lecture
Travel

Jumu'ah:
3–4 demo Fridays

Programmes:
2–3 demo events
```

Production must allow demo data to be removed.

---

# 76. Settings

Settings should include:

## User

- Name
- Profile photo
- Phone
- Email
- Timezone

## Notification

- Default reminder
- Push
- Email
- Quiet hours

## Calendar

- Week starts on
- Default calendar view
- Working hours

## Privacy

- Private data
- PS access

## Appearance

- Light
- Dark
- System

---

# 77. Quiet Hours

Optional.

Allow:

```text
Do not send push notifications
between:
11:00 PM – 7:00 AM
```

Critical notifications can optionally override quiet hours.

---

# 78. Future AI Assistant

AI should be designed as a future module, not required for MVP.

Potential commands:

```text
What do I have tomorrow?

How many classes do I have this week?

Which Fridays are free this month?

What is my next programme?

What preparation is still pending?

Where is my next lecture?

Where did I stop in Surah Al-Baqarah?

Show me all programmes with pending confirmation.
```

AI should access data through controlled backend tools/API.

Never give the AI unrestricted database access.

---

# 79. Future Google Calendar Sync

Potential future feature:

```text
App
 ↕
Google Calendar
```

Support:

- Import
- Export
- Two-way sync
- Conflict detection

But this should not be a dependency for the core application.

---

# 80. Future WhatsApp Integration

The app may later provide:

```text
Open WhatsApp
```

with prefilled message.

Example:

```text
Assalamu Alaikum,
I am confirming the programme scheduled for...
```

Direct automated WhatsApp messaging requires an appropriate official integration/provider and should not be assumed to be available from ordinary shared hosting.

---

# 81. Future Email Automation

Possible workflows:

```text
Programme confirmation
Invitation follow-up
Reminder
Reschedule notification
Cancellation notification
```

Email sending should be asynchronous where practical.

---

# 82. API Versioning

Use:

```text
/api/v1/
```

from the beginning.

Example:

```text
/api/v1/activities
```

This allows future API evolution.

---

# 83. Frontend State Management

Do not introduce a large global state library unless needed.

Recommended:

- TanStack Query for server state
- React local state for local UI state
- Context only for lightweight global concerns

Avoid unnecessary global state complexity.

---

# 84. Form Standards

Use:

```text
React Hook Form
+
Zod
```

for forms.

All important forms must have:

- Client-side validation
- Server-side validation
- Clear error messages
- Loading state
- Success state
- Unsaved changes handling where appropriate

---

# 85. Date & Time UI

Display dates in a human-friendly way.

Examples:

```text
Today
Tomorrow
Friday
12 September
18 September 2026
```

Time:

```text
7:30 PM
```

Store machine-readable values separately.

---

# 86. Accessibility

The application should follow practical WCAG principles.

Include:

- Keyboard navigation
- Focus states
- Labels
- ARIA where necessary
- Sufficient contrast
- Screen-reader-friendly controls
- Accessible modals
- Accessible forms

Do not use color as the only status indicator.

---

# 87. Internationalization Readiness

Primary UI may initially be English or Bengali depending on product decision.

Architecture should remain ready for:

```text
English
বাংলা
العربية
```

Do not hardcode every UI string directly inside complex components.

Use a translation layer if multilingual support is planned.

---

# 88. Bangladesh Localization

Default timezone:

```text
Asia/Dhaka
```

Currency, phone number, date formatting, and language should remain configurable.

Phone numbers should support:

```text
+880...
```

and common local formats.

---

# 89. Accessibility of Religious Terms

Use clear terminology.

Examples:

```text
Jumu'ah
Khutbah
Masjid
Course
Lecture
Programme
```

Do not force every Jumu'ah event into a generic "Event" label in the UI.

---

# 90. Minimal UI Color System

Use a restrained semantic system.

Example semantic meanings:

```text
Success
Warning
Danger
Info
Neutral
```

Avoid assigning a different bright color to every module.

---

# 91. Recommended Screens

## Authentication

```text
/login
/forgot-password
/reset-password
```

## Main

```text
/
/dashboard
/calendar
```

## Classes

```text
/courses
/courses/:id
/class-sessions/:id
```

## Jumu'ah

```text
/jumua
/jumua/:id
/mosques
/mosques/:id
```

## Programmes

```text
/programmes
/programmes/:id
```

## Contacts

```text
/contacts
/contacts/:id
/organizations
```

## Tasks

```text
/tasks
/follow-ups
```

## Settings

```text
/settings
/settings/profile
/settings/notifications
/settings/users
/settings/permissions
```

---

# 92. MVP Scope

The first production release should contain:

### Authentication
- Login
- Logout
- Owner
- PS/Admin

### Dashboard
- Today
- Now
- Next
- Upcoming
- Needs attention

### Activities
- CRUD
- Status
- Notes
- Contacts
- Location
- Reminders

### Calendar
- Day
- Week
- Month
- Filters

### Classes
- Courses
- Recurring schedule
- Generated sessions
- History
- Missed
- Reschedule
- Progress

### Jumu'ah
- Friday overview
- Mosque
- Contact
- Status

### Programmes
- Organizer
- Contact
- Topic
- Confirmation
- Preparation
- Travel

### Contacts
- People
- Organizations
- Mosques

### Notifications
- In-app
- Cron-based reminders
- Push where supported

### PS
- Role-based permissions
- Follow-up
- Status updates

### Security
- Sessions
- Password hashing
- CSRF
- Validation
- Audit logs

---

# 93. Phase 2

Add:

- Advanced conflict detection
- Travel-aware leave time
- Better reports
- Email notifications
- Attachment management
- Advanced follow-up
- Quiet hours
- Annual Jumu'ah analytics
- Course syllabus tracking
- Google Maps integration
- Google Calendar sync

---

# 94. Phase 3

Add:

- AI assistant
- Natural language search
- Smart schedule analysis
- Automated daily briefing
- Preparation suggestions
- Smart conflict explanations
- Advanced analytics

---

# 95. UX Example: Daily Workflow

User opens app.

```text
Dashboard
   ↓
Sees current activity
   ↓
Sees next activity
   ↓
Sees today's schedule
   ↓
Sees pending preparation
   ↓
Sees pending confirmation
```

If next activity is a programme:

```text
Programme
   ↓
Topic
   ↓
Organizer
   ↓
Location
   ↓
Travel
   ↓
Preparation
   ↓
Reminder
```

Everything should be accessible without navigating through multiple unrelated pages.

---

# 96. UX Example: Adding a Programme

```text
+ Add Activity
      ↓
Programme
      ↓
Title
Date
Time
Location
Organizer
Contact
Topic
      ↓
Preparation
      ↓
Travel
      ↓
Reminders
      ↓
Status = Pending
      ↓
Save
```

PS can later update:

```text
Pending → Confirmed
```

The Owner immediately sees the updated status.

---

# 97. UX Example: Weekly Course

```text
Course:
Surah Al-Baqarah

Schedule:
Sat / Mon / Wed
9:00 PM

Start:
1 Jan

End:
31 Dec
```

System generates sessions.

If one session is missed:

```text
Class #47
Missed
Reason:
Programme conflict
```

Then:

```text
Reschedule:
15 Sep
```

History remains intact.

---

# 98. UX Example: Jumu'ah

```text
Jumu'ah
September 2026

04 Sep
Masjid A
Confirmed

11 Sep
Masjid B
Pending

18 Sep
FREE

25 Sep
Masjid C
Confirmed
```

Clicking a confirmed Jumu'ah opens:

```text
Mosque
Contact
Phone
Reference
Khutbah topic
Preparation
Travel
Notes
History
```

---

# 99. UX Example: PS Workflow

PS sees:

```text
Pending Confirmation
--------------------
Programme A
Follow-up due today

Programme B
Awaiting organizer response

Jumu'ah
11 Sep
Pending
```

PS can update these without accessing private Owner data.

Owner sees the resulting status changes on the dashboard.

---

# 100. Definition of Done

The project is considered complete only when:

- App works on desktop.
- App works on mobile.
- App can be installed as PWA where supported.
- Authentication works securely.
- Owner and PS permissions work correctly.
- Activities can be created and edited.
- Calendar works.
- Recurring courses generate sessions correctly.
- Class history is preserved.
- Missed classes can be recorded.
- Classes can be rescheduled.
- Course progress can be tracked.
- Jumu'ah planner works.
- Mosque database works.
- Programme management works.
- Preparation tasks work.
- Travel information works.
- Conflict warnings work.
- Multiple reminders work.
- Cron reminder processing works.
- Notifications are not duplicated.
- Audit logs work.
- Search works.
- Database is indexed.
- Security checks are implemented.
- Production errors are hidden from users.
- Backup procedure is documented.
- cPanel deployment is documented.
- No Laravel dependency exists.
- No persistent Node backend is required.
- Core functionality works on shared hosting.

---

# 101. Deployment Target

Primary target:

```text
Shared Hosting
cPanel
LiteSpeed / Apache
PHP 8.2+
MySQL / MariaDB
HTTPS
Cron
```

The project must not require:

```text
VPS
Docker
Redis
Node backend
Supervisor
PM2
Kubernetes
```

---

# 102. Development Rules for AI Coding Agents

If this project is developed using Lovable or another AI coding agent, follow these rules:

1. Do not redesign the architecture without explicit approval.
2. Do not introduce Laravel.
3. Do not introduce Node.js as a production backend.
4. Do not add unnecessary dependencies.
5. Do not replace MySQL with another database.
6. Keep the backend shared-hosting compatible.
7. Keep business logic in the backend.
8. Never trust frontend permissions.
9. Preserve historical records.
10. Do not overwrite completed class history.
11. Do not silently delete related records.
12. Use migrations for database changes.
13. Use reusable components.
14. Avoid duplicated business logic.
15. Keep UI minimal.
16. Test mobile layouts after major UI changes.
17. Test permissions after every relevant backend change.
18. Test recurring event generation after every recurrence-related change.
19. Test reminder duplication.
20. Do not expose secrets in frontend code.
21. Do not hardcode API keys.
22. Document every new environment variable.
23. Keep production logs safe.
24. Do not use mock data as a substitute for real functionality in production.
25. Never mark a feature complete until its backend, frontend, database, and permission layers are implemented.

---

# 103. Git Repository Structure

Recommended:

```text
personal-life-management/
├── frontend/
├── api/
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
├── scripts/
├── .env.example
├── .gitignore
├── README.md
└── deployment/
    └── cpanel.md
```

---

# 104. Git Branching

Recommended:

```text
main
develop
feature/*
fix/*
```

Production should deploy from:

```text
main
```

---

# 105. Database Migration Strategy

Every schema change must have a migration.

Example:

```text
001_create_users.sql
002_create_roles.sql
003_create_activities.sql
004_create_courses.sql
005_create_class_sessions.sql
...
```

Never manually modify production tables without documenting the change.

---

# 106. Production Checklist

Before deployment:

```text
[ ] HTTPS enabled
[ ] Database created
[ ] DB credentials configured
[ ] API URL configured
[ ] Frontend built
[ ] PWA manifest verified
[ ] Service worker verified
[ ] Cron configured
[ ] Push keys configured if used
[ ] Email configured if used
[ ] File permissions checked
[ ] Upload directory protected
[ ] Error display disabled
[ ] Logging enabled
[ ] Backup configured
[ ] Owner account created
[ ] PS account created
[ ] Permissions tested
[ ] Reminder tested
[ ] Recurring class tested
[ ] Mobile tested
[ ] Desktop tested
```

---

# 107. Performance Target

The application should feel fast on ordinary shared hosting.

Target:

- Initial page load: ideally under 2–3 seconds on a reasonable connection.
- Dashboard API: ideally under 500ms under normal data volume.
- Calendar API: only return relevant date range.
- Search: indexed database queries.
- No unnecessary polling.

For realtime-like updates on shared hosting, prefer:

- short refresh intervals where necessary,
- manual refresh,
- lightweight polling for selected screens,

rather than requiring WebSocket infrastructure.

---

# 108. Important Shared Hosting Constraint

The application must assume that:

- Cron may have limited frequency.
- PHP process time may be limited.
- Memory may be limited.
- Concurrent processes may be limited.
- Web Push libraries may have hosting-specific requirements.
- Some providers may disable certain PHP extensions.

Therefore the system must degrade gracefully.

Core data management must work even if:

- Push notification is unavailable.
- Email is unavailable.
- Maps API is unavailable.

---

# 109. Recommended MVP Development Order

Build in this exact order:

```text
1. Project setup
2. Database schema
3. Authentication
4. RBAC
5. API foundation
6. Layout/navigation
7. Dashboard
8. Activities
9. Calendar
10. Contacts
11. Courses
12. Recurring class engine
13. Class history/progress
14. Jumu'ah
15. Mosques
16. Programmes
17. Preparation
18. Travel
19. Reminders
20. Cron processor
21. Notifications
22. PS workflow
23. Audit logs
24. Search
25. Reports
26. PWA
27. Security audit
28. Performance optimization
29. cPanel deployment
30. Production testing
```

---

# 110. Final Product Vision

The final application should feel like:

```text
                    PERSONAL ASSISTANT
                           |
       +-------------------+-------------------+
       |                   |                   |
    SCHEDULE             CLASSES            PROGRAMMES
       |                   |                   |
    Calendar            Courses             Lectures
    Meetings            Progress            Events
    Travel              History             Preparation
       |                   |                   |
       +-------------------+-------------------+
                           |
                     JUMU'AH PLANNER
                           |
                     CONTACT DATABASE
                           |
                    PS / ADMIN WORKFLOW
                           |
                   REMINDER ENGINE
                           |
                    DIGITAL ASSISTANT
```

The user's primary experience should be:

> **Open the app → immediately understand what is happening now → know what comes next → know where to go → know what needs preparation → receive reminders → maintain complete history.**

The application should remain simple on the surface while maintaining a strong, structured backend underneath.

---

# 111. Non-Negotiable Requirements

These requirements must never be removed during development:

1. No Laravel.
2. No required Node.js backend.
3. Must run on shared hosting.
4. Must support cPanel.
5. Must use MySQL/MariaDB.
6. Must support PHP 8.2+.
7. Must be PWA-ready.
8. Must support recurring classes.
9. Must preserve class history.
10. Must support missed and rescheduled classes.
11. Must support Jumu'ah planning.
12. Must support programme management.
13. Must support preparation tracking.
14. Must support reminders.
15. Must support Owner + PS/Admin roles.
16. Must enforce permissions server-side.
17. Must maintain audit history.
18. Must remain lightweight.
19. Must be mobile responsive.
20. Must be designed for future AI integration.

---

# 112. Summary

This project is a **lightweight Personal Life & Engagement Management System**, not a generic calendar.

Recommended core stack:

```text
Frontend:
React
Vite
TypeScript
Tailwind CSS
shadcn/ui
FullCalendar

Backend:
Core PHP 8.2+
REST API
PDO
PHP Sessions

Database:
MySQL / MariaDB

PWA:
Web Manifest
Service Worker

Scheduling:
cPanel Cron
Custom Reminder Engine

Optional:
Web Push
Email
Google Maps
Google Calendar
AI
```

Primary deployment:

```text
cPanel Shared Hosting
+
LiteSpeed/Apache
+
PHP
+
MySQL/MariaDB
+
Cron
+
HTTPS
```

The architecture must remain modular so that the application can later be migrated from shared hosting to a VPS/cloud environment without rebuilding the entire product.
