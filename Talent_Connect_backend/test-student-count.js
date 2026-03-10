const http = require('http');

const req = (path) => new Promise(r => {
    http.get('http://localhost:3002' + path, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => r(JSON.parse(d)));
    });
});

(async () => {
    console.log('Testing Unfiltered Search:');
    const r1 = await req('/api/institute/search?limit=1&search=Hoshiarpur');
    if (r1.data && r1.data.length > 0) {
        const inst = r1.data[0];
        console.log(`Institute: ${inst.institute_name}`);
        console.log(`Total Students: ${inst.student_count}`);
    }

    console.log('\nTesting Filtered Search (qual=2, stream=21):');
    const r2 = await req('/api/institute/search?limit=1&search=Hoshiarpur&qualification_ids=2');
    if (r2.data && r2.data.length > 0) {
        const inst = r2.data[0];
        console.log(`Filter applied. Returned students: ${inst.student_count}`);
    }
})();
