# GenLab Launchpad LMS — Phase 1 QA Testing & User Flow Guide

> **Target Audience:** Quality Assurance Engineers, Testers, & Product Verification Leads  
> **Phase Scope:** **Phase 1 — HR Admin Slot Allocation & Daily Schedule Inspector**  
> **Core Objective:** Solve HR's toughest operational pain point (unstructured scheduling) by providing a step-by-step creation flow that feeds into the **Schedule Inspector** tab for daily slot & batch monitoring.  
> **Last Updated:** July 2026  

---

## Executive Summary & Core Operational Sequence

Phase 1 focuses on solving one problem at a time. For HRs, **scheduling student slots and managing batch timings is their single most difficult and time-consuming task** due to previous unstructured manual processes.

### 🔄 The Main Admin Operational Sequence:

```mermaid
flowchart LR
    classDef step fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef core fill:#065f46,stroke:#34d399,stroke-width:3px,color:#fff

    S1["1. Create Slots"] --> S2["2. Create Batches"]
    S2 --> S3["3. Register Mentors"]
    S3 --> S4["4. Create Courses"]
    S4 --> S5["5. Onboard Students"]
    S5 --> S6["6. Assign Schedule"]
    S6 --> S7["7. Track Daily via<br/>'Schedule Inspector'"]

    class S1,S2,S3,S4,S5 step
    class S6,S7 core
```

### 📌 Feature Status Matrix for Phase 1 Testing:

| Sector / Navigation Menu | Phase 1 Status | Scope & Purpose for QA |
| :--- | :--- | :--- |
| **Scheduling** (`OPERATIONS`) | **CORE FEATURE (Highest Priority)** | **Primary Scheduling Engine (`/admin/scheduling`).** Assigning & coordinating schedule allocations, student slot mappings, batch timings, and mentor availability. |
| **Schedule Inspector** (`OPERATIONS`) | **CORE FEATURE (Highest Priority)** | **Visual Daily Overview Hub (`/admin/schedule-inspector`).** Provides a visual daily overview of active sessions for management and mentors (external notifications occur out-of-band), grouped by mentor with date picker, refresh control, error banner, and empty state handling. |
| **Students Onboarding** (`DIRECTORY`) | **ACTIVE (High Priority)** | **Single Admin Student Form (`/admin/students`).** Onboarding new students, collecting personal/contact/academic details, and mapping them to course, mentor, batch, and slot schedule. |
| **Batches & Slots** (`OPERATIONS`) | **ACTIVE** | Defining reusable slot timings (10am-12pm, 2pm-4pm, 4pm-6pm) under `/admin/slots` and creating course batches (`/admin/batches`). |
| **Mentors & Courses** (`DIRECTORY`) | **ACTIVE** | Registering mentor profiles (`/admin/mentors`, `*.genlab@gmail.com`) and cataloging active course offerings (`/admin/courses`). |
| **Payments** (`FINANCIALS`) | **OVERVIEW ONLY** | Basic payment overview/summary flag only (`/admin/payments`). Deep granular payment logic is deferred. |
| **Home / Analytics** (`OVERVIEW`) | **ACTIVE** | Top-level platform enrollment stats and slot metrics overview (`/admin/dashboard`). |
| **Student & Mentor Portals** | ⏸️ **ON HOLD** | Student phone OTP (`/student/dashboard`) & Mentor login portals (`/mentor/dashboard`) are paused for future phases. |
| **AWS S3 File Storage** | ⏸️ **ON HOLD** | Document file upload storage is paused for Phase 1. |

---

## 1. Phase 1 High-Level System Architecture

This diagram shows how the Admin creation pipeline builds schedule data that is rendered on the **Schedule Inspector** view (`/admin/schedule-inspector`) via the Spring Boot REST backend proxy and Supabase database.

```mermaid
flowchart TD
    classDef frontend fill:#1e1e2e,stroke:#cfff00,stroke-width:2px,color:#ffffff
    classDef backend fill:#111827,stroke:#3b82f6,stroke-width:2px,color:#ffffff
    classDef db fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff

    subgraph FE ["Frontend Layer (React 19 + Hero UI + Zustand)"]
        UI_Form["Admin Creation Views<br/>('/admin/slots' -> '/admin/batches' -> '/admin/mentors' -> '/admin/courses' -> '/admin/students' -> '/admin/scheduling')"]
        UI_Inspector["Schedule Inspector View<br/>('/admin/schedule-inspector')<br/>(Daily Batch Timings & Mentor Cards)"]
        Zustand["Zustand State Store<br/>(Schedule & Batch Allocation Data)"]
        Axios["Axios REST API Client"]

        UI_Form --> Zustand
        UI_Inspector <--> Zustand
        Zustand <--> Axios
    end

    subgraph BE ["Backend Layer (Spring Boot 4.1.0)"]
        Ctrl["REST Controller Layer"]
        AOP["@RequiresRole('ADMIN') Aspect"]
        Svc["Slot & Schedule Service"]
        Repo["Spring Data JPA Repository"]

        Axios <--> Ctrl
        Ctrl --> AOP
        Ctrl --> Svc
        Svc --> Repo
    end

    subgraph DB ["Database Layer (Supabase PostgreSQL 17)"]
        Supabase["Supabase DB<br/>(slots_t, batches_t, students_t, enrollments_t)"]
        Repo <--> Supabase
    end

    class UI_Form,UI_Inspector,Zustand,Axios frontend
    class Ctrl,AOP,Svc,Repo backend
    class Supabase db
```

---

## 2. Main Admin Flow — Step-by-Step QA Decision Tree

QA Testers should execute and verify the end-to-end flow in this exact chronological order.

```mermaid
flowchart TD
    classDef step fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef core fill:#064e3b,stroke:#34d399,stroke-width:3px,color:#fff
    classDef decision fill:#334155,stroke:#f59e0b,stroke-width:2px,color:#fff

    Start(["QA Test Start"]) --> Step1["1. Admin HR Logs In via *@genlab.cc"]
    Step1 --> Step2["2. Define Reusable Slot Timings under 'Slots' (/admin/slots)"]
    Step2 --> Step3["3. Create Batches for Courses under 'Batches' (/admin/batches)"]
    Step3 --> Step4["4. Register Mentors under 'Mentors' (/admin/mentors) *.genlab@gmail.com"]
    Step4 --> Step5["5. Catalog Courses under 'Courses' (/admin/courses)"]
    Step5 --> Step6["6. Onboard Student under 'Students' (/admin/students) & Map Course Details"]
    Step6 --> Step7["7. Assign Schedule under 'Scheduling' (/admin/scheduling)"]
    Step7 --> Step8["8. Open 'Schedule Inspector' View (/admin/schedule-inspector) under OPERATIONS"]
    Step8 --> CheckDate["9. Select Target Date on Inspector Header (DD-MM-YYYY)"]
    CheckDate --> VerifyCards{"10. Verify Schedule Inspector Output"}

    VerifyCards -->|Pass: Cards Grouped by Mentor with Batch Timings| CheckChronological["11. Confirm Batch Cards are Sorted Chronologically e.g. 10am, 2pm, 4pm"]
    VerifyCards -->|Fail: Missing Batch or Misaligned Card| LogDefect["Log QA Defect: Schedule Inspector Rendering Issue"]

    CheckChronological --> OverviewPayment["12. Verify High-Level Payment Overview Status under 'Payments' (/admin/payments)"]
    OverviewPayment --> TestPass(["13. Main Setup & Daily Inspector Flow PASSED"])

    class Start,Step1,Step2,Step3,Step4,Step5,LogDefect,OverviewPayment step
    class Step6,Step7,Step8,CheckDate,CheckChronological,TestPass core
    class VerifyCards decision
```

---

## 3. Single Phase 1 Admin Schedule Lifecycle

This state machine details how a student slot & batch setup progresses from initial definition to active daily monitoring.

```mermaid
stateDiagram-v2
    [*] --> SlotTimingDefined : Admin creates Slot (/admin/slots)
    
    SlotTimingDefined --> BatchCreated : Batch created for Course (/admin/batches)
    
    BatchCreated --> MentorMapped : Mentor assigned to Batch (/admin/mentors)
    
    MentorMapped --> CourseAssigned : Course linked (/admin/courses)
    
    CourseAssigned --> StudentEnrolled : Student onboarded (/admin/students)
    
    StudentEnrolled --> ScheduleAssigned : Schedule allocated (/admin/scheduling)
    
    ScheduleAssigned --> ActiveOnScheduleInspector : Appears live on 'Schedule Inspector' (/admin/schedule-inspector)
    
    state DailyMonitoring {
        [*] --> RenderVisualOverview : Display visual daily schedule cards by date
        RenderVisualOverview --> ViewMentorSessionCards : Management & Mentors check daily session allocations
        ViewMentorSessionCards --> ActiveOnScheduleInspector
    }

    ActiveOnScheduleInspector --> [*] : Active Batch Completed
```

---

## 4. Sector Breakdown & Daily Operational Hub

The dashboard navigation maps directly to the Admin's setup sequence across four core category groups, ending at their daily primary screen: **Schedule Inspector**.

```mermaid
graph TD
    classDef hub fill:#065f46,stroke:#34d399,stroke-width:3px,color:#fff;
    classDef stepSec fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#fff;
    classDef summarySec fill:#334155,stroke:#94a3b8,stroke-width:1px,color:#fff;

    Nav["GenLab Admin Sidebar Navigation"]

    Nav --> Cat1["1. OVERVIEW"]
    Cat1 --> Home["Home ('/admin/dashboard')<br/>- Dashboard displaying key metrics & enrollment analytics"]

    Nav --> Cat2["2. DIRECTORY"]
    Cat2 --> Students["Students ('/admin/students')<br/>- Onboards student records & links to Batch, Mentor, Course & Slot"]
    Cat2 --> Courses["Courses ('/admin/courses')<br/>- Catalog of active courses & module details"]
    Cat2 --> Mentors["Mentors ('/admin/mentors')<br/>- Directory of mentor profiles (*.genlab@gmail.com)"]

    Nav --> Cat3["3. OPERATIONS"]
    Cat3 --> Batches["Batches ('/admin/batches')<br/>- Defines course batches and mappings"]
    Cat3 --> Slots["Slots ('/admin/slots')<br/>- Manages customizable slot timing presets"]
    Cat3 --> Scheduling["Scheduling ('/admin/scheduling')<br/>- Assigns schedule allocations"]
    Cat3 --> Hub["★ Schedule Inspector ('/admin/schedule-inspector') (VISUAL HUB)<br/>- Provides visual daily overview of active sessions<br/>- Used by management & mentors for daily schedule checks<br/>- External communications occur out-of-band<br/>- Displays active batch timings grouped by Mentor<br/>- Date Picker (DD-MM-YYYY) & Refresh Action<br/>- Backend Connection Error Alert Banner<br/>- 'No Active Slots Found' Empty State Card"]

    Nav --> Cat4["4. FINANCIALS"]
    Cat4 --> Payments["Payments ('/admin/payments')<br/>- High-level student course fee overview & status updates"]

    class Hub hub
    class Students,Courses,Mentors,Batches,Slots,Scheduling stepSec
    class Home,Payments,Cat1,Cat2,Cat3,Cat4 summarySec
```

---

## 5. Phase 1 Data Model for Schedule Inspector

Schema entity relations supporting the batch creation pipeline and Schedule Inspector output.

```mermaid
erDiagram
    user_roles_t ||--o{ students_t : "managed by admin"
    courses_t ||--o{ batches_t : "has"
    mentors_t ||--o{ batches_t : "assigned to"
    batches_t ||--o{ slots_t : "scheduled in"
    students_t ||--o{ enrollments_t : "enrolled in"
    batches_t ||--o{ enrollments_t : "groups"
    students_t ||--o{ slots_t : "allocated to"

    user_roles_t {
        uuid user_id PK
        string role "admin"
    }

    courses_t {
        uuid id PK
        string title
        decimal fee
    }

    mentors_t {
        uuid id PK
        string name
        string email "*.genlab@gmail.com"
    }

    batches_t {
        uuid id PK
        uuid course_id FK
        uuid mentor_id FK
        string batch_name
        date start_date
    }

    students_t {
        uuid id PK
        string name
        string personal_mobile
        string parent_mobile
        string institution_name
    }

    slots_t {
        uuid id PK
        uuid batch_id FK
        uuid mentor_id FK
        uuid student_id FK
        string time_slot "10am-12pm / 2pm-4pm / 4pm-6pm"
        date schedule_date
        string status "SCHEDULED / COMPLETED"
    }

    payments_t {
        uuid id PK
        uuid student_id FK
        string status_overview "PENDING / COMPLETED"
    }
```

---

## 6. QA Test Execution Matrix

### 6.1 Highest Priority: Daily Schedule Inspector (`/admin/schedule-inspector`)
- [ ] **Daily Inspector View Loading:** Open `OPERATIONS` $\rightarrow$ `Schedule Inspector` (`/admin/schedule-inspector`). Confirm page header renders title, subtitle, date selector, and sync/refresh button.
- [ ] **Date Picker Selector:** Change date using native date picker (`DD-MM-YYYY`, e.g. `06-07-2026`). Confirm active slot allocations re-filter dynamically for the chosen date (`startDate <= selectedDate && endDate >= selectedDate`).
- [ ] **Manual Refresh Control:** Click the sync/refresh button next to the date input. Verify slot data re-fetches from the REST backend.
- [ ] **Backend Disconnection Banner:** Simulate offline/disconnected backend. Verify high-visibility pink alert banner displays: `Failed to connect to the backend server to retrieve schedule details.`
- [ ] **Empty State Component:** Select a date with zero active enrollments. Verify centered card displays `No Active Slots Found` with text `There are no active student enrollments scheduled for the date YYYY-MM-DD.`
- [ ] **Mentor Grouping & Card Order:** Confirm active slot cards are grouped distinctly under assigned Mentors and sorted chronologically (e.g. 10:00 AM before 02:00 PM).

### 6.2 Sidebar Navigation & Category Layout
- [ ] **4-Category Organization:** Verify dark sidebar items are organized into four category headings: `OVERVIEW` (`/admin/dashboard`), `DIRECTORY` (`/admin/students`, `/admin/courses`, `/admin/mentors`), `OPERATIONS` (`/admin/batches`, `/admin/slots`, `/admin/scheduling`, `/admin/schedule-inspector`), `FINANCIALS` (`/admin/payments`).
- [ ] **Collapsible Sidebar:** Click `Collapse <<` button at the bottom of the sidebar. Confirm sidebar collapses/expands smoothly.

### 6.3 Setup Sequence Verification
- [ ] **Sequential Creation:** Test creating in order: `Slots` (`/admin/slots`) $\rightarrow$ `Batches` (`/admin/batches`) $\rightarrow$ `Mentors` (`/admin/mentors`) $\rightarrow$ `Courses` (`/admin/courses`) $\rightarrow$ `Students` (`/admin/students`) $\rightarrow$ `Scheduling` (`/admin/scheduling`).
- [ ] **Mentor Email Validation:** Ensure mentor email strictly matches `*.genlab@gmail.com`.
- [ ] **Student-to-Batch Mapping:** Onboard a student and assign them to an active batch & slot. Confirm they appear under that batch on the Schedule Inspector for active dates.

### 6.4 Financials & Scope Boundaries
- [ ] **Payment Overview:** Verify `FINANCIALS` $\rightarrow$ `Payments` (`/admin/payments`) displays a basic overview/flag only. Confirm no complex payment gateway or installment breakdown errors break the view.
- [ ] **Admin Authentication:** Verify access requires `@genlab.cc` Admin sign-in. Confirm student (`/student/dashboard`) and mentor (`/mentor/dashboard`) sign-in routes are disabled/on-hold.

---

> **QA Lead Operational Summary:** HRs use the sequential flow (Slots $\rightarrow$ Batches $\rightarrow$ Mentors $\rightarrow$ Courses $\rightarrow$ Students $\rightarrow$ Scheduling) to set up data, then use **Schedule Inspector** under `OPERATIONS` (`/admin/schedule-inspector`) daily to manage batch timings and mentor slot availability.
