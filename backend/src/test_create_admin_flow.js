import crypto from 'crypto';

const API_BASE = 'http://localhost:5000/api';

async function run() {
  console.log('🧪 Starting Create Admin Feature Verification Test...\n');

  // Step 1: Super Admin Login
  console.log('1️⃣ Super Admin Login...');
  const saLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'emobilitysuperadmin@gmail.com',
      password: 'Admin@123'
    })
  });
  const saLoginData = await saLoginRes.json();
  if (!saLoginData.token) {
    throw new Error('Super Admin login failed: ' + JSON.stringify(saLoginData));
  }
  const saToken = saLoginData.token;
  console.log('   ✅ Super Admin authenticated. Token received.\n');

  // Step 2: Create Admin User (Super Admin only)
  console.log('2️⃣ Super Admin creates new admin user...');
  const testOfficialEmail = `official.admin.${Date.now()}@emobility.lk`;
  const testPersonalEmail = `personal.admin.${Date.now()}@gmail.com`;

  const createRes = await fetch(`${API_BASE}/auth/admins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${saToken}`
    },
    body: JSON.stringify({
      name: 'Chamara Silva',
      officialEmail: testOfficialEmail,
      personalEmail: testPersonalEmail
    })
  });
  const createData = await createRes.json();
  if (!createData.success) {
    throw new Error('Create admin failed: ' + JSON.stringify(createData));
  }
  console.log('   ✅ Admin user created successfully:');
  console.log('   - Name:', createData.admin.name);
  console.log('   - Official Email (Username):', createData.admin.officialEmail);
  console.log('   - Personal Email (Delivery):', createData.admin.personalEmail);
  console.log('   - must_change_password flag:', createData.admin.mustChangePassword);
  console.log('   - Temp password length:', createData.tempPassword ? createData.tempPassword.length : 'N/A');
  console.log('   - Set Password URL:', createData.setPasswordUrl);

  const adminId = createData.admin.id;
  const tempPassword = createData.tempPassword;
  const setPasswordUrl = createData.setPasswordUrl;
  const setupToken = new URL(setPasswordUrl).searchParams.get('token');

  // Verify password complexity requirements: min 12 chars, upper, lower, number, symbol
  if (tempPassword.length < 12) throw new Error('Temp password does not meet min 12 chars');
  if (!/[A-Z]/.test(tempPassword)) throw new Error('Temp password missing uppercase');
  if (!/[a-z]/.test(tempPassword)) throw new Error('Temp password missing lowercase');
  if (!/[0-9]/.test(tempPassword)) throw new Error('Temp password missing number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(tempPassword)) throw new Error('Temp password missing symbol');
  console.log('   ✅ Temp password meets all cryptographic complexity requirements (12+ chars, upper, lower, digit, symbol).\n');

  // Step 3: Duplicate Official Email validation
  console.log('3️⃣ Verifying Duplicate Official Email rejection...');
  const dupRes = await fetch(`${API_BASE}/auth/admins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${saToken}`
    },
    body: JSON.stringify({
      name: 'Duplicate Test',
      officialEmail: testOfficialEmail,
      personalEmail: 'other.personal@gmail.com'
    })
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 400 || !dupData.message.includes('already exists')) {
    throw new Error('Expected duplicate email rejection, got: ' + JSON.stringify(dupData));
  }
  console.log('   ✅ Duplicate official email rejected with clear message:', dupData.message, '\n');

  // Step 4: Login behavior with temporary password (must_change_password forced redirect)
  console.log('4️⃣ Admin attempts login with temporary password (must_change_password enforcement)...');
  const tempLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testOfficialEmail,
      password: tempPassword
    })
  });
  const tempLoginData = await tempLoginRes.json();
  if (!tempLoginData.mustChangePassword) {
    throw new Error('Expected mustChangePassword flag on login with temp password, got: ' + JSON.stringify(tempLoginData));
  }
  console.log('   ✅ Login intercepted: mustChangePassword is TRUE.');
  console.log('   - Redirection URL:', tempLoginData.redirect);
  console.log('   - Message:', tempLoginData.message, '\n');

  // Step 5: Verify setup token validity
  console.log('5️⃣ Verifying Password Setup Token via /verify-setup-token...');
  const verifyTokenRes = await fetch(`${API_BASE}/auth/verify-setup-token?token=${setupToken}`);
  const verifyTokenData = await verifyTokenRes.json();
  if (!verifyTokenData.valid) {
    throw new Error('Token verification failed: ' + JSON.stringify(verifyTokenData));
  }
  console.log('   ✅ Setup token verified. Administrator:', verifyTokenData.admin.name, `(${verifyTokenData.admin.officialEmail})\n`);

  // Step 6: Test Resend Credentials action by Super Admin
  console.log('6️⃣ Super Admin triggers "Resend Credentials" action...');
  const resendRes = await fetch(`${API_BASE}/auth/admins/${adminId}/resend-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${saToken}`
    },
    body: JSON.stringify({ personalEmail: testPersonalEmail })
  });
  const resendData = await resendRes.json();
  if (!resendData.success) {
    throw new Error('Resend credentials failed: ' + JSON.stringify(resendData));
  }
  console.log('   ✅ Fresh credentials and setup token generated.');
  console.log('   - New Set Password URL:', resendData.setPasswordUrl);

  const newSetupToken = new URL(resendData.setPasswordUrl).searchParams.get('token');
  const newTempPassword = resendData.tempPassword;

  // Step 7: Verify old token was invalidated
  console.log('7️⃣ Verifying old token was invalidated by Resend action...');
  const oldTokenCheck = await fetch(`${API_BASE}/auth/verify-setup-token?token=${setupToken}`);
  const oldTokenData = await oldTokenCheck.json();
  if (oldTokenData.valid) {
    throw new Error('Old token was NOT invalidated!');
  }
  console.log('   ✅ Old token correctly rejected:', oldTokenData.message, '\n');

  // Step 8: Set permanent password (testing strength validation failure)
  console.log('8️⃣ Testing password strength validation (submitting weak password)...');
  const weakSetRes = await fetch(`${API_BASE}/auth/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: newSetupToken,
      newPassword: 'weak',
      confirmPassword: 'weak'
    })
  });
  const weakSetData = await weakSetRes.json();
  if (weakSetRes.status !== 400 || !weakSetData.message.includes('8 characters')) {
    throw new Error('Expected weak password rejection, got: ' + JSON.stringify(weakSetData));
  }
  console.log('   ✅ Weak password rejected:', weakSetData.message, '\n');

  // Step 9: Set permanent password (strong password)
  console.log('9️⃣ Submitting strong permanent password...');
  const newPermanentPassword = 'SecureAdmin#2026!';
  const setPassRes = await fetch(`${API_BASE}/auth/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: newSetupToken,
      newPassword: newPermanentPassword,
      confirmPassword: newPermanentPassword
    })
  });
  const setPassData = await setPassRes.json();
  if (!setPassData.success) {
    throw new Error('Set permanent password failed: ' + JSON.stringify(setPassData));
  }
  console.log('   ✅ Permanent password set successfully:', setPassData.message, '\n');

  // Step 10: Verify setup token cannot be reused (single-use enforcement)
  console.log('🔟 Verifying single-use setup token cannot be reused...');
  const reuseCheck = await fetch(`${API_BASE}/auth/verify-setup-token?token=${newSetupToken}`);
  const reuseData = await reuseCheck.json();
  if (reuseData.valid) {
    throw new Error('Used token was NOT invalidated!');
  }
  console.log('   ✅ Token reuse rejected as expected:', reuseData.message, '\n');

  // Step 11: Normal login with newly set permanent password
  console.log('1️⃣1️⃣ Admin logs in with official email and newly set permanent password...');
  const permLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testOfficialEmail,
      password: newPermanentPassword
    })
  });
  const permLoginData = await permLoginRes.json();
  // Admin is now active and requires daily login photo verification (or receives direct session)
  if (permLoginData.mustChangePassword) {
    throw new Error('Unexpected mustChangePassword flag after permanent password was set!');
  }
  if (!permLoginData.requiresPhotoVerification && !permLoginData.token) {
    throw new Error('Login failed with new password: ' + JSON.stringify(permLoginData));
  }
  console.log('   ✅ Login successful! must_change_password flag was cleared.');
  console.log('   - Daily verification stage entered / Token granted.\n');

  console.log('🎉 ALL 11 CREATE ADMIN & PASSWORD SETUP TESTS PASSED SUCCESSFULLY! 🚀');
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
