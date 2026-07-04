# Spec: Course Management

## Purpose
Manage catalog courses, tracks, syllabus configurations, active status, and compute dynamic student engagement metrics.

## Requirements

### Requirement: Dynamic Course Activity Metrics
The system must dynamically compute and serve weekly active student counts for each course over the past 7 weeks.

#### Scenario: Fetch Course Details
- **WHEN** a course details request is made
- **THEN** the API response must include a list of 7 integers representing the active student count for each week from 6 weeks ago to the current week.

#### Scenario: Render Activity Chart
- **WHEN** the course activity chart is rendered
- **THEN** the bars must scale proportionally based on the maximum value in the weekly active student list, and show actual counts when hovered.
