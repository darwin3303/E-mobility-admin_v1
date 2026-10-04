async function testFinesApi() {
  try {
    console.log('--- 1. Testing GET /api/fines ---');
    const res1 = await fetch('http://localhost:5000/api/fines');
    const fines1 = await res1.json();
    console.log(`Retrieved ${fines1.length} fines:`);
    fines1.forEach(f => {
      console.log(`  - [${f.id}] Plate: ${f.vehiclePlate}, Speed: ${f.speedRecorded}, Limit: ${f.speedLimit}, Status: ${f.status}, Camera: ${f.camera}`);
    });

    console.log('\n--- 2. Testing GET /api/fines?plate=WP+CAB-4521 ---');
    const res2 = await fetch('http://localhost:5000/api/fines?plate=WP+CAB-4521');
    const fines2 = await res2.json();
    console.log(`Filtered for WP CAB-4521 (${fines2.length} records):`, fines2.map(f => ({ id: f.id, speed: f.speedRecorded, status: f.status })));

    console.log('\n--- 3. Testing GET /api/fines/TX-88421 ---');
    const res3 = await fetch('http://localhost:5000/api/fines/TX-88421');
    const fine3 = await res3.json();
    console.log('Detail for TX-88421:', {
      id: fine3.id,
      plate: fine3.vehiclePlate,
      capturedSpeed: fine3.capturedSpeed,
      speedLimit: fine3.speedLimit,
      excessSpeed: fine3.excessSpeed,
      radar: fine3.radarCalibration,
      camera: fine3.camera,
      location: fine3.locationCoords,
      status: fine3.status
    });

    console.log('\n--- 4. Testing POST /api/fines/violations (Record new violation) ---');
    const res4 = await fetch('http://localhost:5000/api/fines/violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehiclePlate: 'WP CAB-4521',
        speedDetected: 128,
        speedLimit: 100,
        camera: 'CAM-07 • SOUTHERN EXPY KM 68.4',
        locationCoords: '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)'
      })
    });
    console.log('Record violation response:', await res4.json());

    console.log('\n✅ All API tests passed successfully!');
  } catch (err) {
    console.error('API test error:', err);
  }
}

testFinesApi();
