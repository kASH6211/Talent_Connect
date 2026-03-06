-- Delete test records created during debugging
DELETE FROM master_stream_branch WHERE "stream_branch_Id" >= 141;

-- Reset sequence to actual max after deletion
SELECT setval(
    'master_stream_branch_stream_branch_Id_seq',
    (SELECT MAX("stream_branch_Id") FROM master_stream_branch)
);
