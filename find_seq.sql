-- Find all sequences for the master_stream_branch table
SELECT 
    s.sequencename,
    s.last_value,
    s.increment_by
FROM pg_sequences s
WHERE s.sequencename LIKE '%stream_branch%';
