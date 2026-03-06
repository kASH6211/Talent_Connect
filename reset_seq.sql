-- Reset the sequence to MAX(stream_branch_Id) to allow new inserts
SELECT setval(
    'master_stream_branch_stream_branch_Id_seq',
    (SELECT MAX("stream_branch_Id") FROM master_stream_branch)
);
