-- NCC Enrollment Portal - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(15) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  course VARCHAR(100) NOT NULL,
  extracurricular TEXT,
  achievements TEXT,
  ncc_certificate VARCHAR(20) NOT NULL CHECK (ncc_certificate IN ('A Certificate', 'B Certificate', 'NIL')),
  guardian_name VARCHAR(100) NOT NULL,
  guardian_phone VARCHAR(15) NOT NULL,
  height DECIMAL(5,2) NOT NULL CHECK (height > 0),
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  percentage_10 DECIMAL(5,2) NOT NULL CHECK (percentage_10 BETWEEN 0 AND 100),
  percentage_12 DECIMAL(5,2) NOT NULL CHECK (percentage_12 BETWEEN 0 AND 100),
  school_activity VARCHAR(50) NOT NULL CHECK (school_activity IN ('SPC', 'Scouts & Guides', 'Red Cross', 'Other', 'NIL')),
  parent_service VARCHAR(30) NOT NULL CHECK (parent_service IN ('Currently Serving', 'Ex-Service', 'No')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_gender ON applications(gender);
CREATE INDEX IF NOT EXISTS idx_applications_ncc_certificate ON applications(ncc_certificate);
CREATE INDEX IF NOT EXISTS idx_applications_school_activity ON applications(school_activity);
CREATE INDEX IF NOT EXISTS idx_applications_name ON applications(name);
CREATE INDEX IF NOT EXISTS idx_applications_whatsapp ON applications(whatsapp);
CREATE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);
