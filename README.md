# GraduateSupportApp v0.1

A personalized career guidance platform for recent graduates, providing AI-powered task recommendations tailored to individual career goals.

## Overview

GraduateSupportApp helps newly graduated students navigate their post-graduation journey by providing personalized, prioritized career advice. The platform uses AI to analyze user goals and generate actionable tasks presented as easy-to-read cards.

## Hackathon MVP Scope

This is a streamlined version focused on delivering core value quickly:

### Core Features (MVP)
1. **Quick Signup** - Email-only registration (no password persistence needed for demo)
2. **Simple Profile** - Collect just the essentials:
   - Degree earned
   - Target job/career path
   - Top 3 career goals/priorities
3. **AI-Powered Advice** - Generate 3-5, ranked tasks using LLM
4. **Card Display** - Clean, simple flashcard showing prioritized advice

### Out of Scope (Future)
- User authentication/sessions
- Profile editing
- Task completion tracking
- Progress analytics
- Database persistence (use local/session storage for demo)

## User Flow

**Simple 3-step process:**

1. **Landing Page** → Enter email
2. **Onboarding Form** → Quick questionnaire (degree, target job, 3 goals)
3. **Results Page** → View AI-generated advice cards

Total time to advice: ~2 minutes

## Task Structure

Each AI-generated task includes:
```json
{
  "rank": 1,
  "advice": "Specific actionable recommendation",
  "reasoning": "Brief explanation of why this advice matters"
}
```

## Tech Stack (Recommended for Speed)

### Backend
- TBD

### AI Integration
- TBD 

### Storage
- TBD