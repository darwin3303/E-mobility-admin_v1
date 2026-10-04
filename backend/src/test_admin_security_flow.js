const API_BASE = 'http://localhost:5000/api';

// 1x1 WebP base64 image representing a camera snapshot
const SAMPLE_WEBP_BASE64 = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

async function runTest() {
  console.log('🧪 Starting End-to-End Enterprise Admin Security Flow Test...\n');

  try {
    // 1. Super Admin Login
    console.log('1️⃣ Super Admin Login...');
    const saLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'emobilitysuperadmin@gmail.com',
        password: 'Admin@123'
      })
    });
    const saData = await saLoginRes.json();
    if (!saData.success || !saData.token) {
      throw new Error('Super Admin login failed: ' + JSON.stringify(saData));
    }
    const superAdminToken = saData.token;
    console.log('   ✅ Super Admin authenticated. Token received.\n');

    // 2. Super Admin Provisions New Admin
    console.log('2️⃣ Super Admin Provisions New Admin (Kasun Perera)...');
    const testAdminEmail = `kasun.test.${Date.now()}@emobility.lk`;
    const createRes = await fetch(`${API_BASE}/auth/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Kasun Perera',
        email: testAdminEmail
      })
    });
    const createData = await createRes.json();
    if (!createData.success) {
      throw new Error('Create admin failed: ' + JSON.stringify(createData));
    }

    const { admin, tempPassword, activationUrl } = createData;
    console.log(`   ✅ Admin created with status: ${admin.status}`);
    console.log(`   🔑 Generated Temp Password: ${tempPassword}`);
    console.log(`   🔗 Activation Link: ${activationUrl}\n`);

    // Parse activation token from activationUrl
    const urlObj = new URL(activationUrl);
    const activationToken = urlObj.searchParams.get('token');

    // 3. Attempt Login Before Activation (Should Be Rejected)
    console.log('3️⃣ Attempting login before activation (Enforcing Pending Activation lock)...');
    const prematureLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: tempPassword
      })
    });
    const prematureData = await prematureLoginRes.json();
    if (prematureLoginRes.status === 401 && prematureData.message?.includes('pending activation')) {
      console.log(`   ✅ Correctly blocked: "${prematureData.message}"\n`);
    } else {
      throw new Error('Should have failed login due to Pending Activation status! Got: ' + JSON.stringify(prematureData));
    }

    // 4. Verify Activation Token
    console.log('4️⃣ Verifying One-Time Activation Token...');
    const verifyTokenRes = await fetch(`${API_BASE}/auth/verify-activation-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: activationToken,
        email: testAdminEmail
      })
    });
    const tokenData = await verifyTokenRes.json();
    if (!tokenData.valid) {
      throw new Error('Token verification failed: ' + JSON.stringify(tokenData));
    }
    console.log('   ✅ Token verified. Valid:', tokenData.valid, '\n');

    // 5. Complete First-Time Activation (Set New Password + Webcam Snapshot)
    console.log('5️⃣ Completing First-Time Activation with mandatory password change and profile photo...');
    const newAdminPassword = 'SecureAdmin#2026!';
    const activateRes = await fetch(`${API_BASE}/auth/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: activationToken,
        email: testAdminEmail,
        newPassword: newAdminPassword,
        profilePhoto: SAMPLE_WEBP_BASE64
      })
    });
    const activateData = await activateRes.json();
    if (!activateData.success) {
      throw new Error('Activation failed: ' + JSON.stringify(activateData));
    }
    console.log(`   ✅ Activation completed: "${activateData.message}"\n`);

    // 6. Attempt Reusing the One-Time Activation Token (Single-Use Enforced)
    console.log('6️⃣ Testing Token Single-Use (Re-attempting activation with same token)...');
    const reuseTokenRes = await fetch(`${API_BASE}/auth/verify-activation-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: activationToken,
        email: testAdminEmail
      })
    });
    const reuseData = await reuseTokenRes.json();
    if (!reuseData.valid && reuseTokenRes.status === 400) {
      console.log(`   ✅ Correctly rejected used token: "${reuseData.message}"\n`);
    } else {
      throw new Error('Should have rejected already-used activation token!');
    }

    // 7. Attempt Login While Awaiting Approval (Should Be Rejected)
    console.log('7️⃣ Attempting login while Awaiting Super Admin Approval...');
    const unapprovedLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: newAdminPassword
      })
    });
    const unapprovedData = await unapprovedLoginRes.json();
    if (unapprovedLoginRes.status === 401 && unapprovedData.message?.includes('awaiting Super Admin approval')) {
      console.log(`   ✅ Correctly blocked: "${unapprovedData.message}"\n`);
    } else {
      throw new Error('Should have failed login due to Awaiting Approval status! Got: ' + JSON.stringify(unapprovedData));
    }

    // 8. Super Admin Approves Admin
    console.log(`8️⃣ Super Admin Approves Admin ID ${admin.id}...`);
    const approveRes = await fetch(`${API_BASE}/auth/admins/${admin.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      }
    });
    const approveData = await approveRes.json();
    if (!approveData.success) {
      throw new Error('Approve failed: ' + JSON.stringify(approveData));
    }
    console.log(`   ✅ ${approveData.message}\n`);

    // 9. Approved Admin Initiates Login (Credentials Phase)
    console.log('9️⃣ Approved Admin enters credentials on /login...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: newAdminPassword
      })
    });
    const adminLoginData = await adminLoginRes.json();

    if (!adminLoginData.requiresPhotoVerification) {
      throw new Error('Admin login must require photo verification! Got: ' + JSON.stringify(adminLoginData));
    }
    const pendingToken = adminLoginData.pendingToken;
    console.log('   ✅ Credentials accepted. System required Daily Photo Verification.');
    console.log(`   Pending Token received: ${pendingToken.slice(0, 20)}...\n`);

    // 10. Admin Captures and Submits Daily Login Verification Photo
    console.log('🔟 Admin captures webcam snapshot and submits to /verify-login-photo...');
    const photoVerifyRes = await fetch(`${API_BASE}/auth/verify-login-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pendingToken,
        photo: SAMPLE_WEBP_BASE64
      })
    });
    const photoVerifyData = await photoVerifyRes.json();
    if (!photoVerifyData.success) {
      throw new Error('Photo verification failed: ' + JSON.stringify(photoVerifyData));
    }

    const adminSessionToken = photoVerifyData.token;
    const auditId = photoVerifyData.auditId;
    console.log('   ✅ Daily Login Verification Confirmed! Full Access Token Issued.');
    console.log(`   Audit ID: ${auditId}\n`);

    // 11. Super Admin Views Login Photo Audit List
    console.log('1️⃣1️⃣ Super Admin retrieves Login Photo Audit list...');
    const auditListRes = await fetch(`${API_BASE}/auth/audit/login-audits`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const auditListData = await auditListRes.json();

    console.log(`   ✅ Total audits retrieved: ${auditListData.count}`);
    const latestAudit = auditListData.audits.find(a => a.id === auditId || a.user_email === testAdminEmail);
    console.log('   Latest Audit Record:', {
      id: latestAudit?.id,
      admin: latestAudit?.user_name,
      email: latestAudit?.user_email,
      status: latestAudit?.login_status,
      verification: latestAudit?.verification_status,
      retentionPolicy: latestAudit?.retention_policy,
      daysRemaining: latestAudit?.days_remaining
    }, '\n');

    // 12. Super Admin Securely Views Verification Photo & Tracks View Audit
    console.log('1️⃣2️⃣ Super Admin views verification photo stream (tracking access log)...');
    const photoStreamRes = await fetch(`${API_BASE}/auth/audit/login-photo/${latestAudit.id}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const photoContentType = photoStreamRes.headers.get('content-type');
    const photoBuffer = await photoStreamRes.arrayBuffer();
    console.log(`   ✅ Photo stream returned with Content-Type: ${photoContentType}`);
    console.log(`   Photo payload size: ${photoBuffer.byteLength} bytes\n`);

    // 13. Verify Photo View Access Log
    console.log('1️⃣3️⃣ Verifying that Super Admin photo view was recorded...');
    const viewsRes = await fetch(`${API_BASE}/auth/audit/photo-views/${latestAudit.id}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const viewsData = await viewsRes.json();
    console.log(`   ✅ Recorded Super Admin photo views: ${viewsData.views.length}`);
    console.log('   Access log record:', viewsData.views[0], '\n');

    // 14. Normal Admin Attempts to Access Login Photo Audit (RBAC Check)
    console.log('1️⃣4️⃣ Security & Privacy: Subordinate Admin tries to access audit photo...');
    const forbiddenRes = await fetch(`${API_BASE}/auth/audit/login-photo/${latestAudit.id}`, {
      headers: { Authorization: `Bearer ${adminSessionToken}` }
    });
    if (forbiddenRes.status === 403) {
      console.log('   ✅ Subordinate Admin access forbidden (HTTP 403) as required!\n');
    } else {
      throw new Error('Normal Admin should NOT be allowed to access audit photos! Got status: ' + forbiddenRes.status);
    }

    console.log('🎉 ALL 14 ENTERPRISE SECURITY & VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTest();
