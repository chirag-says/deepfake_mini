
CREATE TABLE analysis_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_hash TEXT NOT NULL,
  original_content TEXT NOT NULL,
  trust_score INTEGER NOT NULL,
  status TEXT NOT NULL,
  analysis_message TEXT,
  keywords TEXT,
  flags TEXT,
  sources TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_content_hash ON analysis_results(content_hash);
