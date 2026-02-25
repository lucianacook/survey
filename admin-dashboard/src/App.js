import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import './App.css';

// Admin client with service_role - bypasses RLS
const supabaseAdmin = createClient(
  'https://nvipwqthamsglqcaqyjs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXB3cXRoYW1zZ2xxY2FxeWpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3Nzc2MywiZXhwIjoyMDg3NDUzNzYzfQ.HoZo8owLUK1PPQdrAyWolSuNJLUEM_JOt5tqiuSrb5E',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Auth client for login only (uses anon key)
const supabaseAuth = createClient(
  'https://nvipwqthamsglqcaqyjs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXB3cXRoYW1zZ2xxY2FxeWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Nzc3NjMsImV4cCI6MjA4NzQ1Mzc2M30.aql34XsFCX-wthzqIo1vR0jbLmDvR2-VXYiC-X7T1Yg'
);

const COLORS = ['#0A6B6E', '#1A8F8F', '#C8704A', '#6B6B6B', '#0088FE', '#00C49F'];

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responses, setResponses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics state
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    started: 0,
    completed: 0,
    avgCompletionTime: 0,
    dropOffByQuestion: []
  });

  useEffect(() => {
    // Check if already authenticated
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
        loadData();
      }
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      setAuthenticated(true);
      loadData();
    }
    setLoading(false);
  };

  const loadData = async () => {
    setLoading(true);

    // Load survey responses using admin client
    const { data: surveyData, error: surveyError } = await supabaseAdmin
      .from('survey_responses')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (!surveyError) setResponses(surveyData || []);

    // Load contacts using admin client
    const { data: contactData, error: contactError } = await supabaseAdmin
      .from('follow_up_contacts')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (!contactError) setContacts(contactData || []);

    // Load analytics data
    // 1. Page views
    const { data: pageViewsData, error: pageViewsError } = await supabaseAdmin
      .from('page_views')
      .select('*');

    // 2. Question progress
    const { data: questionProgressData, error: questionProgressError } = await supabaseAdmin
      .from('question_progress')
      .select('*');

    // Calculate analytics
    if (!pageViewsError && !questionProgressError && !surveyError) {
      const totalPageViews = pageViewsData?.length || 0;
      const totalStarted = pageViewsData?.filter(pv => pv.started).length || 0;
      const totalCompleted = surveyData?.length || 0;

      // Calculate average completion time
      let avgCompletionTime = 0;
      if (surveyData && surveyData.length > 0) {
        const completionTimes = surveyData
          .filter(r => r.started_at && r.completed_at)
          .map(r => {
            const start = new Date(r.started_at);
            const end = new Date(r.completed_at);
            return (end - start) / 1000 / 60; // minutes
          });

        if (completionTimes.length > 0) {
          avgCompletionTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
        }
      }

      // Calculate drop-off by question
      const questionProgress = questionProgressData || [];
      const questionCounts = {};
      questionProgress.forEach(qp => {
        questionCounts[qp.question_id] = (questionCounts[qp.question_id] || 0) + 1;
      });

      const dropOffByQuestion = Object.entries(questionCounts)
        .map(([question_id, count]) => ({
          question: question_id,
          reached: count,
          dropOffRate: totalStarted > 0 ? Math.round(((totalStarted - count) / totalStarted) * 100) : 0
        }))
        .sort((a, b) => b.dropOffRate - a.dropOffRate);

      setAnalytics({
        pageViews: totalPageViews,
        started: totalStarted,
        completed: totalCompleted,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10, // round to 1 decimal
        dropOffByQuestion
      });
    }

    setLoading(false);
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;

    // Flatten responses
    const rows = responses.map(r => ({
      id: r.id,
      completed_at: r.completed_at,
      ...r.responses
    }));

    // Convert to CSV
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportContactsToCSV = () => {
    if (contacts.length === 0) return;

    const csv = [
      'id,name,contact,submitted_at,contacted,notes',
      ...contacts.map(c =>
        `${c.id},"${c.name}","${c.contact}",${c.submitted_at},${c.contacted},"${c.notes || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const updateContactStatus = async (contactId, contacted) => {
    await supabaseAdmin
      .from('follow_up_contacts')
      .update({ contacted })
      .eq('id', contactId);
    loadData();
  };

  // Analytics helpers
  const getQuestionStats = (questionId) => {
    const answers = responses
      .map(r => r.responses[questionId])
      .filter(Boolean);

    const counts = {};
    answers.forEach(answer => {
      if (Array.isArray(answer)) {
        answer.forEach(a => counts[a] = (counts[a] || 0) + 1);
      } else {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  if (!authenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Wellness Survey Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Wellness Survey Dashboard</h1>
        <button onClick={() => supabaseAuth.auth.signOut().then(() => setAuthenticated(false))}>
          Logout
        </button>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'responses' ? 'active' : ''}
          onClick={() => setActiveTab('responses')}
        >
          Responses ({responses.length})
        </button>
        <button
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
        >
          Contacts ({contacts.length})
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </nav>

      <main>
        {activeTab === 'overview' && (
          <div className="overview">
            <h2 style={{marginBottom: '24px', color: '#1C1C1C'}}>Survey Funnel</h2>
            <div className="stat-cards">
              <div className="stat-card">
                <h3>Page Views</h3>
                <p className="stat-number">{analytics.pageViews}</p>
                <p style={{fontSize: '13px', color: '#6B6B6B', marginTop: '8px'}}>
                  Total visitors to survey
                </p>
              </div>
              <div className="stat-card">
                <h3>Started</h3>
                <p className="stat-number">{analytics.started}</p>
                <p style={{fontSize: '13px', color: '#6B6B6B', marginTop: '8px'}}>
                  {analytics.pageViews > 0 ? Math.round((analytics.started / analytics.pageViews) * 100) : 0}% start rate
                </p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-number">{analytics.completed}</p>
                <p style={{fontSize: '13px', color: '#6B6B6B', marginTop: '8px'}}>
                  {analytics.started > 0 ? Math.round((analytics.completed / analytics.started) * 100) : 0}% completion rate
                </p>
              </div>
              <div className="stat-card">
                <h3>Avg. Time</h3>
                <p className="stat-number">{analytics.avgCompletionTime}<span style={{fontSize: '18px'}}>min</span></p>
                <p style={{fontSize: '13px', color: '#6B6B6B', marginTop: '8px'}}>
                  Time to complete survey
                </p>
              </div>
            </div>

            <h2 style={{margin: '40px 0 24px', color: '#1C1C1C'}}>Engagement Metrics</h2>
            <div className="stat-cards">
              <div className="stat-card">
                <h3>Follow-up Contacts</h3>
                <p className="stat-number">{contacts.length}</p>
                <p style={{fontSize: '13px', color: '#6B6B6B', marginTop: '8px'}}>
                  {analytics.completed > 0 ? Math.round((contacts.length / analytics.completed) * 100) : 0}% of completions
                </p>
              </div>
              <div className="stat-card">
                <h3>Overall Conversion</h3>
                <p className="stat-number">
                  {analytics.pageViews > 0 ? Math.round((analytics.completed / analytics.pageViews) * 100) : 0}%
                </p>
                <p style={{fontSize: '13px', color: '#6B6B6B', marginTop: '8px'}}>
                  Visitors → completions
                </p>
              </div>
            </div>

            {/* Drop-off analysis */}
            {analytics.dropOffByQuestion.length > 0 && (
              <>
                <h2 style={{margin: '40px 0 24px', color: '#1C1C1C'}}>Drop-off Analysis</h2>
                <div className="chart-section">
                  <h3>Questions with Highest Drop-off</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.dropOffByQuestion.slice(0, 10)}>
                      <XAxis dataKey="question" angle={-45} textAnchor="end" height={80} />
                      <YAxis label={{ value: 'Drop-off Rate (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="dropOffRate" fill="#C8704A" />
                    </BarChart>
                  </ResponsiveContainer>
                  <table style={{width: '100%', marginTop: '20px', fontSize: '14px'}}>
                    <thead>
                      <tr style={{borderBottom: '1px solid #E8E4DD'}}>
                        <th style={{textAlign: 'left', padding: '8px', color: '#6B6B6B'}}>Question</th>
                        <th style={{textAlign: 'right', padding: '8px', color: '#6B6B6B'}}>Reached</th>
                        <th style={{textAlign: 'right', padding: '8px', color: '#6B6B6B'}}>Drop-off Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dropOffByQuestion.slice(0, 10).map((q, idx) => (
                        <tr key={idx} style={{borderBottom: '1px solid #E8E4DD'}}>
                          <td style={{padding: '8px'}}>{q.question}</td>
                          <td style={{padding: '8px', textAlign: 'right'}}>{q.reached}</td>
                          <td style={{padding: '8px', textAlign: 'right', color: q.dropOffRate > 50 ? '#C8704A' : '#1C1C1C'}}>
                            {q.dropOffRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <button onClick={loadData} className="refresh-btn" disabled={loading} style={{marginTop: '32px'}}>
              {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
            </button>
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="responses">
            <div className="section-header">
              <h2>Survey Responses</h2>
              <button onClick={exportToCSV} className="export-btn">
                📥 Export to CSV
              </button>
            </div>

            <div className="response-list">
              {responses.map(response => (
                <div key={response.id} className="response-card">
                  <div className="response-meta">
                    <span>ID: {response.id.slice(0, 8)}</span>
                    <span>Completed: {format(new Date(response.completed_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <details>
                    <summary>View responses</summary>
                    <pre>{JSON.stringify(response.responses, null, 2)}</pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="contacts">
            <div className="section-header">
              <h2>Follow-up Contacts</h2>
              <button onClick={exportContactsToCSV} className="export-btn">
                📥 Export to CSV
              </button>
            </div>

            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Submitted</th>
                  <th>Contacted</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td>{contact.contact}</td>
                    <td>{format(new Date(contact.submitted_at), 'MMM d, yyyy')}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={contact.contacted}
                        onChange={(e) => updateContactStatus(contact.id, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

{activeTab === 'analytics' && (
          <div className="analytics">
            <h2>Product Insights</h2>

            {/* Market Opportunity */}
            <div className="insight-section">
              <h3 className="insight-title">💡 Market Opportunity</h3>
              <div className="insight-grid">
                <div className="insight-card">
                  <div className="insight-number">
                    {(() => {
                      const stopped = responses.filter(r =>
                        ['Yes, but I stopped', "I've tried a few times but it never stuck"].includes(r.responses.q3)
                      ).length;
                      return Math.round((stopped / responses.length) * 100) || 0;
                    })()}%
                  </div>
                  <div className="insight-label">Tried journaling but stopped</div>
                  <div className="insight-detail">Your target market - they want this but current tools failed them</div>
                </div>

                <div className="insight-card">
                  <div className="insight-number">
                    {(() => {
                      const struggle = responses.filter(r =>
                        ['Not really: I know something\'s there but can\'t see it clearly',
                         'No, this is something I actively struggle with'].includes(r.responses.q7)
                      ).length;
                      return Math.round((struggle / responses.length) * 100) || 0;
                    })()}%
                  </div>
                  <div className="insight-label">Struggle to see their patterns</div>
                  <div className="insight-detail">Core problem to solve - help people understand themselves</div>
                </div>

                <div className="insight-card">
                  <div className="insight-number">
                    {(() => {
                      const therapyGaps = responses.filter(r =>
                        Array.isArray(r.responses.q10) && r.responses.q10.some(ans =>
                          ans.includes('gap between sessions') || ans.includes('recall specific situations')
                        )
                      ).length;
                      return Math.round((therapyGaps / responses.length) * 100) || 0;
                    })()}%
                  </div>
                  <div className="insight-label">Therapy users with unmet needs</div>
                  <div className="insight-detail">Supplement therapy - bridge the gap between sessions</div>
                </div>
              </div>
            </div>

            {/* Why Journaling Failed */}
            <div className="chart-section">
              <h3>🚨 Why Journaling Failed (Your Opportunity)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getQuestionStats('q5')}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#C8704A" />
                </BarChart>
              </ResponsiveContainer>
              <p style={{marginTop: '12px', color: '#6B6B6B', fontSize: '14px'}}>
                <strong>Key insight:</strong> People quit because it feels like a chore and doesn't provide value.
                Build something that feels effortless and shows clear benefits.
              </p>
            </div>

            {/* AI Receptivity */}
            <div className="insight-section">
              <h3 className="insight-title">🤖 AI Product Validation</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                  <h4 style={{marginBottom: '16px'}}>Market Receptivity</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getQuestionStats('q13')}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {getQuestionStats('q13').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 style={{marginBottom: '16px'}}>Top Concerns</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getQuestionStats('q14')}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0A6B6E" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="insight-box" style={{marginTop: '20px', padding: '16px', background: '#E8F4F4', borderRadius: '8px'}}>
                <strong>Addressable Market:</strong> {(() => {
                  const open = responses.filter(r =>
                    ['Excited: that sounds genuinely useful', 'Curious but cautious: I\'d want to understand how it works'].includes(r.responses.q13)
                  ).length;
                  return Math.round((open / responses.length) * 100) || 0;
                })()}% are excited or curious about AI for self-reflection
                <br/>
                <strong>Must Address:</strong> Privacy is the #1 concern - make this crystal clear in your product
              </div>
            </div>

            {/* Pricing Strategy */}
            <div className="chart-section">
              <h3>💰 Pricing Strategy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getQuestionStats('q17')}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1A8F8F" />
                </BarChart>
              </ResponsiveContainer>
              <div className="insight-box" style={{marginTop: '20px', padding: '16px', background: '#F7F4EF', borderRadius: '8px'}}>
                <strong>Recommended Price Point:</strong> {(() => {
                  const stats = getQuestionStats('q17');
                  const mostCommon = stats[0];
                  return mostCommon ? mostCommon.name : 'Insufficient data';
                })()}
                <br/>
                <strong>Willingness to Pay $10+/month:</strong> {(() => {
                  const willing = responses.filter(r =>
                    ['$5 to $10 per month', '$11 to $20 per month', '$21 to $30 per month',
                     'More than $30 per month, if it actually worked'].includes(r.responses.q17)
                  ).length;
                  return Math.round((willing / responses.length) * 100) || 0;
                })()}%
              </div>
            </div>

            {/* User Quotes */}
            <div className="insight-section">
              <h3 className="insight-title">💬 What Users Want (Q15: The Dream Tool)</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                {responses
                  .filter(r => r.responses.q15 && r.responses.q15.length > 20)
                  .slice(0, 10)
                  .map((r, idx) => (
                    <div key={idx} className="quote-box" style={{
                      padding: '16px',
                      background: 'white',
                      borderLeft: '4px solid #0A6B6E',
                      borderRadius: '4px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1C1C1C'
                    }}>
                      "{r.responses.q15}"
                    </div>
                  ))}
              </div>
              {responses.filter(r => r.responses.q15 && r.responses.q15.length > 20).length === 0 && (
                <p style={{color: '#6B6B6B', fontStyle: 'italic'}}>No detailed responses yet. Collect more data!</p>
              )}
            </div>

            {/* User Segments */}
            <div className="insight-section">
              <h3 className="insight-title">👥 User Segments</h3>
              <div className="insight-grid">
                <div className="segment-card">
                  <div className="segment-name">Journaling Dropouts</div>
                  <div className="segment-count">
                    {responses.filter(r =>
                      ['Yes, but I stopped', "I've tried a few times but it never stuck"].includes(r.responses.q3)
                    ).length} people
                  </div>
                  <div className="segment-desc">Tried journaling but quit - frustrated with current tools</div>
                </div>

                <div className="segment-card">
                  <div className="segment-name">Therapy Seekers</div>
                  <div className="segment-count">
                    {responses.filter(r =>
                      ['Yes, I\'m currently in therapy', 'Yes, I\'ve been in therapy in the past'].includes(r.responses.q8)
                    ).length} people
                  </div>
                  <div className="segment-desc">In/used therapy - looking for tools that complement it</div>
                </div>

                <div className="segment-card">
                  <div className="segment-name">Pattern Blind</div>
                  <div className="segment-count">
                    {responses.filter(r =>
                      ['Not really: I know something\'s there but can\'t see it clearly',
                       'No, this is something I actively struggle with'].includes(r.responses.q7)
                    ).length} people
                  </div>
                  <div className="segment-desc">Can't see their patterns - need help with self-awareness</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
