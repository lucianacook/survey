-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Survey responses table (anonymous)
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL UNIQUE, -- Supabase anonymous user ID

  -- Response data (flexible JSON structure)
  responses JSONB NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft duplicate prevention (hashed, no PII)
  fingerprint_hash TEXT,

  -- Constraints
  CONSTRAINT status_check CHECK (status IN ('in_progress', 'completed'))
);

-- Indexes for performance
CREATE INDEX idx_survey_responses_session ON survey_responses(session_id);
CREATE INDEX idx_survey_responses_status ON survey_responses(status);
CREATE INDEX idx_survey_responses_completed ON survey_responses(completed_at);
CREATE INDEX idx_survey_responses_fingerprint ON survey_responses(fingerprint_hash);

-- Follow-up contacts table (completely separate, NO link to survey_responses)
CREATE TABLE follow_up_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL, -- email or linkedin
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE INDEX idx_contacts_submitted ON follow_up_contacts(submitted_at);
CREATE INDEX idx_contacts_contacted ON follow_up_contacts(contacted);

-- Rate limiting table (abuse prevention)
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint_hash TEXT NOT NULL UNIQUE,
  submission_count INTEGER NOT NULL DEFAULT 1,
  last_submission_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ
);

CREATE INDEX idx_rate_limits_fingerprint ON rate_limits(fingerprint_hash);

-- Row Level Security (RLS) policies
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Survey responses: Users can only access their own session
CREATE POLICY "Users can insert own responses"
  ON survey_responses FOR INSERT
  WITH CHECK (session_id = auth.uid());

CREATE POLICY "Users can update own in-progress responses"
  ON survey_responses FOR UPDATE
  USING (session_id = auth.uid() AND status = 'in_progress');

CREATE POLICY "Users can read own responses"
  ON survey_responses FOR SELECT
  USING (session_id = auth.uid());

-- Follow-up contacts: Insert only, read requires admin
CREATE POLICY "Anyone can insert contact"
  ON follow_up_contacts FOR INSERT
  WITH CHECK (true);

-- Rate limits: Insert and read own fingerprint
CREATE POLICY "Users can read own rate limit"
  ON rate_limits FOR SELECT
  USING (true);

CREATE POLICY "Users can insert rate limit"
  ON rate_limits FOR INSERT
  WITH CHECK (true);

-- Helper function for rate limiting
CREATE OR REPLACE FUNCTION increment_rate_limit(fp TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO rate_limits (fingerprint_hash, submission_count, last_submission_at)
  VALUES (fp, 1, NOW())
  ON CONFLICT (fingerprint_hash)
  DO UPDATE SET
    submission_count = rate_limits.submission_count + 1,
    last_submission_at = NOW(),
    blocked_until = CASE
      WHEN rate_limits.submission_count >= 3 THEN NOW() + INTERVAL '24 hours'
      ELSE rate_limits.blocked_until
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
