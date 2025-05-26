# Portfolio CMS Setup

This document provides instructions for setting up the CMS backend for your portfolio website.

## Prerequisites

1. Supabase account and project
2. Vercel account with your portfolio project

## Setup Steps

### 1. Database Setup

1. Go to your Supabase project
2. Navigate to the SQL Editor
3. Run the SQL script in `db/schema.sql` to create all necessary tables

### 2. Authentication Setup

1. In Supabase, go to Authentication > Settings
2. Enable Email provider
3. Set up a password for your admin account (ojigboleo@gmail.com)

### 3. Environment Variables

Add the following environment variables to your Vercel project:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=your_vercel_deployment_url
\`\`\`

### 4. Accessing the CMS

1. Deploy your project to Vercel
2. Navigate to `/cms/login` on your deployed site
3. Log in with your admin email (ojigboleo@gmail.com) and password

## CMS Features

The CMS provides management for:

- Projects
- Blog Posts
- Certifications
- Work Experiences
- Skills
- Site Settings

## Security

- Only the admin email (ojigboleo@gmail.com) can access the CMS
- All CMS routes are protected by authentication
- The Supabase service role key is only used server-side for secure operations
