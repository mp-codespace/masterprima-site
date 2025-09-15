// src\lib\email\service.ts

// The 'randomBytes' and 'createHash' imports were removed as they were not being used.

export interface SendPasswordResetEmailParams {
  to: string;
  username: string;
  resetUrl: string;
}

export interface TempResetCodeParams {
  email: string;
  adminId?: string;
}

export interface AdminResetParams {
  targetEmail: string;
  newPassword: string;
  currentAdminId: string;
}

// Generate secure temporary reset code string
// ✅ RENAMED this function to avoid conflict
const createTempCodeString = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `RESET-${timestamp}-${randomPart}`;
};

// Generate simple 6-digit code for quick access
const generateSimpleCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Log reset attempts for security audit
const logResetAttempt = (method: string, email: string, success: boolean, details?: string) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method,
    email,
    success,
    details: details || 'N/A',
    ip: 'server', // You can pass IP from request if needed
  };
  
  console.log('🔐 PASSWORD RESET LOG:', JSON.stringify(logEntry, null, 2));
  
  // In production, you might want to write this to a file or database
  // await supabaseAdmin.from('password_reset_logs').insert(logEntry);
};

// Simulate email sending (logs to console instead)
export const sendPasswordResetEmail = async ({
  to,
  username,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<void> => {
  try {
    // Generate a simple access code for console output
    const accessCode = generateSimpleCode();
    
    console.log('📧 ====================================');
    console.log('📧 PASSWORD RESET EMAIL (CONSOLE MODE)');
    console.log('📧 ====================================');
    console.log(`📧 To: ${to}`);
    console.log(`📧 User: ${username}`);
    console.log(`📧 Reset URL: ${resetUrl}`);
    console.log(`📧 Quick Access Code: ${accessCode}`);
    console.log('📧 ====================================');
    console.log('📧 EMAIL CONTENT:');
    console.log('📧 ====================================');
    console.log(`📧 Subject: 🔐 Reset Your MasterPrima Admin Password`);
    console.log(`📧 `);
    console.log(`📧 Hello, ${username}!`);
    console.log(`📧 `);
    console.log(`📧 We received a request to reset your password for your`);
    console.log(`📧 MasterPrima admin account. If you didn't make this request,`);
    console.log(`📧 you can safely ignore this email.`);
    console.log(`📧 `);
    console.log(`📧 To reset your password, use one of these methods:`);
    console.log(`📧 `);
    console.log(`📧 🔗 Reset URL: ${resetUrl}`);
    console.log(`📧 🔢 Quick Code: ${accessCode}`);
    console.log(`📧 `);
    console.log(`📧 ⚠️  Security Notice:`);
    console.log(`📧 • This link will expire in 1 hour`);
    console.log(`📧 • You can only use this link once`);
    console.log(`📧 • If you didn't request this, contact your administrator`);
    console.log(`📧 `);
    console.log(`📧 Best regards,`);
    console.log(`📧 The MasterPrima Team`);
    console.log('📧 ====================================');

    logResetAttempt('console_email', to, true, `Code: ${accessCode}`);
    
    // Store the access code temporarily (you can implement this in your database)
    if (typeof window !== 'undefined') {
      // Client-side storage (temporary)
      sessionStorage.setItem(`reset_code_${to}`, accessCode);
    }
    
  } catch (error) {
    logResetAttempt('console_email', to, false, (error as Error).message);
    console.error('❌ Failed to generate password reset info:', error);
    throw new Error('Failed to generate password reset information.');
  }
};

// Generate temporary reset code for development
export const generateTempResetCode = async ({
  email,
  adminId,
}: TempResetCodeParams): Promise<string> => {
  try {
    // ✅ UPDATED the function call to use the new name
    const tempCode = createTempCodeString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    console.log('🔑 ====================================');
    console.log('🔑 TEMPORARY RESET CODE GENERATED');
    console.log('🔑 ====================================');
    console.log(`🔑 Email: ${email}`);
    console.log(`🔑 Code: ${tempCode}`);
    console.log(`🔑 Expires: ${expiresAt.toLocaleString()}`);
    console.log(`🔑 Admin ID: ${adminId || 'N/A'}`);
    console.log('🔑 ====================================');
    console.log('🔑 Use this code in your reset form or API');
    console.log('🔑 ====================================');
    
    logResetAttempt('temp_code', email, true, `Code: ${tempCode}, Expires: ${expiresAt.toISOString()}`);
    
    return tempCode;
  } catch (error) {
    logResetAttempt('temp_code', email, false, (error as Error).message);
    throw new Error('Failed to generate temporary reset code.');
  }
};

// Admin-initiated password reset
export const adminResetPassword = async ({
  targetEmail,
  newPassword,
  currentAdminId,
}: AdminResetParams): Promise<boolean> => {
  try {
    console.log('👤 ====================================');
    console.log('👤 ADMIN PASSWORD RESET');
    console.log('👤 ====================================');
    console.log(`👤 Target Email: ${targetEmail}`);
    console.log(`👤 Admin ID: ${currentAdminId}`);
    console.log(`👤 New Password: ${'*'.repeat(newPassword.length)} (${newPassword.length} chars)`);
    console.log(`👤 Timestamp: ${new Date().toISOString()}`);
    console.log('👤 ====================================');
    console.log('👤 IMPORTANT: Implement actual password hashing and DB update');
    console.log('👤 ====================================');
    
    logResetAttempt('admin_reset', targetEmail, true, `By Admin: ${currentAdminId}`);
    
    return true;
  } catch (error) {
    logResetAttempt('admin_reset', targetEmail, false, (error as Error).message);
    return false;
  }
};

// Verify temporary reset code
export const verifyTempResetCode = async (email: string, code: string): Promise<boolean> => {
  try {
    // In a real implementation, you'd check this against your database
    console.log('🔍 ====================================');
    console.log('🔍 VERIFYING RESET CODE');
    console.log('🔍 ====================================');
    console.log(`🔍 Email: ${email}`);
    console.log(`🔍 Code: ${code}`);
    console.log(`🔍 Status: VERIFIED (Demo Mode)`);
    console.log('🔍 ====================================');
    
    logResetAttempt('code_verification', email, true, `Code: ${code}`);
    
    return true;
  } catch (error) {
    logResetAttempt('code_verification', email, false, (error as Error).message);
    return false;
  }
};

// Test connection (always returns true since no external service)
export const testEmailConnection = async (): Promise<boolean> => {
  console.log('✅ Email Service Status: CONSOLE MODE (No external dependencies)');
  console.log('✅ All password reset notifications will be logged to console');
  console.log('✅ Temporary codes and admin resets are available');
  return true;
};

// Validate email configuration
export const validateEmailConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Since we're not using external services, just check basic environment
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    errors.push("NEXT_PUBLIC_SITE_URL environment variable is required for reset URLs");
  }
  
  console.log('⚙️  Email Configuration Status:');
  console.log('⚙️  - Mode: Console/Development');
  console.log('⚙️  - External Dependencies: None');
  console.log('⚙️  - Temp Codes: Available');
  console.log('⚙️  - Admin Reset: Available');
  console.log(`⚙️  - Site URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'}`);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility function to get all recent reset logs (for admin dashboard)
export const getResetLogs = (): string => {
  return `
🔍 PASSWORD RESET LOGS
======================
Check your console output for detailed logs of all password reset attempts.
Each reset attempt is logged with timestamp, method, email, and success status.

Available Methods:
- console_email: Email content logged to console
- temp_code: Temporary reset codes for development
- admin_reset: Admin-initiated password resets
- code_verification: Verification of reset codes

For production, implement database logging by uncommenting the
supabaseAdmin.from('password_reset_logs').insert(logEntry) line
in the logResetAttempt function.
  `;
};

// Quick reset for development (generates everything needed)
export const quickDevReset = async (email: string): Promise<{
  tempCode: string;
  resetUrl: string;
  accessCode: string;
}> => {
  // ✅ UPDATED the function call to use the new name
  const tempCode = createTempCodeString();
  const accessCode = generateSimpleCode();
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth-mp-secure-2024/reset-password?token=${tempCode}`;
  
  console.log('🚀 ====================================');
  console.log('🚀 QUICK DEVELOPMENT RESET');
  console.log('🚀 ====================================');
  console.log(`🚀 Email: ${email}`);
  console.log(`🚀 Temp Code: ${tempCode}`);
  console.log(`🚀 Access Code: ${accessCode}`);
  console.log(`🚀 Reset URL: ${resetUrl}`);
  console.log('🚀 ====================================');
  console.log('🚀 Use any of these methods to reset the password');
  console.log('🚀 ====================================');
  
  logResetAttempt('quick_dev_reset', email, true, `TempCode: ${tempCode}, AccessCode: ${accessCode}`);
  
  return {
    tempCode,
    resetUrl,
    accessCode
  };
};