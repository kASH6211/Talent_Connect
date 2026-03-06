-- Check the actual max ID in the table (using quoted identifier for case sensitivity)
SELECT MAX("stream_branch_Id") AS max_id FROM master_stream_branch;
