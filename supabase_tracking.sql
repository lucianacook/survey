-- Analytics tracking tables for survey

-- Track page views (landing on survey)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  started BOOLEAN DEFAULT FALSE,
  session_id UUID -- links to survey_responses if they start
);

-- Track question-by-question progress (to see drop-offs)
CREATE TABLE IF NOT EXISTS question_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES survey_responses(session_id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  reached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_question_progress_session ON question_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_question_progress_question ON question_progress(question_id);

-- RLS Policies
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_progress ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for tracking
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert question progress"
  ON question_progress FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read their own progress
CREATE POLICY "Users can read own question progress"
  ON question_progress FOR SELECT
  USING (session_id = auth.uid());
