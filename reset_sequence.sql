-- Reset all primary key sequences that may be out of sync
-- This fixes the "duplicate key value violates unique constraint" error

SELECT setval(
    pg_get_serial_sequence('master_stream_branch', 'stream_branch_Id'),
    COALESCE((SELECT MAX("stream_branch_Id") FROM master_stream_branch), 1)
);
