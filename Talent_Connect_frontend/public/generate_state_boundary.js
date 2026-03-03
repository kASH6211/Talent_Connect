const fs = require('fs');
const turf = require('@turf/turf');

try {
    const raw = fs.readFileSync('punjab.geojson', 'utf8');
    const data = JSON.parse(raw);

    let statePoly = data.features[0];

    for (let i = 1; i < data.features.length; i++) {
        try {
            statePoly = turf.union(turf.featureCollection([statePoly, data.features[i]]));
        } catch (err) {
            console.error('Failed to union feature ' + i, err.message);
        }
    }

    fs.writeFileSync('punjab_state.geojson', JSON.stringify(statePoly, null, 2));
    console.log('Successfully created punjab_state.geojson');
} catch (err) {
    console.error(err);
}
