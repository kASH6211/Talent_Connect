-- ALTER SEQUENCE to restart past max value
-- This fixes duplicate key errors when max(id) in table == sequence last_value
ALTER SEQUENCE "master_stream_branch_stream_branch_Id_seq" RESTART WITH 141;
