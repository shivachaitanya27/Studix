# Studix Database Setup Guide

This directory contains the master PostgreSQL schema for **Studix**:
- File: [`schema.sql`](./schema.sql)

## 1. Quick Setup in Supabase Dashboard (Recommended)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (or create a new one).
3. Navigate to **SQL Editor** in the left sidebar.
4. Click **New query**.
5. Copy the entire contents of [`schema.sql`](./schema.sql) and paste it into the editor.
6. Click **Run** (or press `Ctrl+Enter`).

## What this creates:
- **UUID Extension**: `uuid-ossp`
- **ENUM Types**: `user_role`, `resource_type`, `upload_status`
- **Tables**:
  - `colleges`: Multi-tenant institutions catalog
  - `departments`: Academic engineering departments
  - `users`: User profiles linked to Supabase Auth `auth.users`
  - `subjects`: Curriculum subjects mapped to department, year, and semester
  - `resources`: Academic question papers, notes, manuals, assignments
  - `ai_chats`: Private AI solver sessions
  - `ai_messages`: Multi-turn chat messages
  - `bookmarks`: Student saved resources
  - `notifications`: Student and system notifications
- **Row Level Security (RLS)**: Enforced on all tables with student and admin access control.
- **Initial Seed Data**:
  - Pre-populated colleges: JNTUH-CEH, IIT Hyderabad, OU-UCE, VNR-VJIET
  - Pre-populated departments: CSE, ECE, EEE, IT, AI-DS, MECH
  - Pre-populated subjects across Years 1 to 4 and Semesters 1 to 8.

## 2. Environment Variables
Copy your Project URL and API keys from Supabase Settings -> API into your `.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
