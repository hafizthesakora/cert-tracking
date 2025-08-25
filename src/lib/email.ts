import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define the structure for our email data
interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    await resend.emails.send({
      from: 'Certification Portal <onboarding@resend.dev>', // Must be a verified domain in Resend
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// --- Email Templates ---

export const getExpiresSoonEmail = (
  userName: string,
  certName: string,
  expiryDate: string
) => ({
  subject: `Action Required: Your ${certName} Certification is Expiring Soon`,
  html: `<p>Hello ${userName},</p><p>This is a reminder that your <strong>${certName}</strong> certification is set to expire on <strong>${expiryDate}</strong>. Please log in to the portal to request a renewal.</p>`,
});

export const getRenewalRequestedEmail = (
  userName: string,
  certName: string,
  portalMasterName: string
) => ({
  subject: `Renewal Requested for ${certName}`,
  html: `<p>Hello ${portalMasterName},</p><p>${userName} has requested a renewal for their <strong>${certName}</strong> certification. Please log in to the portal to initiate the process.</p>`,
});

export const getRenewalInitiatedEmail = (
  userName: string,
  certName: string,
  renewalDate: string
) => ({
  subject: `Your ${certName} Renewal has been Scheduled`,
  html: `<p>Hello ${userName},</p><p>Your renewal for the <strong>${certName}</strong> certification has been initiated and is scheduled for <strong>${renewalDate}</strong>. Please ensure you attend.</p>`,
});

export const getRenewalConfirmedEmail = (
  userName: string,
  certName: string,
  newExpiryDate: string
) => ({
  subject: `Congratulations! Your ${certName} Certification has been Renewed`,
  html: `<p>Hello ${userName},</p><p>Your <strong>${certName}</strong> certification has been successfully renewed. Your new expiry date is <strong>${newExpiryDate}</strong>.</p>`,
});

export const getRenewalPostponedEmail = (
  userName: string,
  certName: string
) => ({
  subject: `Your ${certName} Certification Renewal has been Postponed`,
  html: `<p>Hello ${userName},</p><p>Your renewal for the <strong>${certName}</strong> certification has been postponed. A portal master will reschedule it soon.</p>`,
});
