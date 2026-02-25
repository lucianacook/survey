-- Update RLS policies for email magic link authentication

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert own responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can update own in-progress responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can read own responses" ON survey_responses;

-- Create new policies for authenticated users
CREATE POLICY "Authenticated users can insert own responses"
  ON survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (session_id = auth.uid());

CREATE POLICY "Authenticated users can update own responses"
  ON survey_responses FOR UPDATE
  TO authenticated
  USING (session_id = auth.uid());

CREATE POLICY "Authenticated users can read own responses"
  ON survey_responses FOR SELECT
  TO authenticated
  USING (session_id = auth.uid());

-- Follow-up contacts: Allow authenticated users to insert
DROP POLICY IF EXISTS "Anyone can insert contact" ON follow_up_contacts;

CREATE POLICY "Authenticated users can insert contact"
  ON follow_up_contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);
