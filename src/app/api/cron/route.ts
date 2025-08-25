import { NextResponse } from 'next/server';
import prisma from '@/lib/primsa';
import { sendEmail, getExpiresSoonEmail } from '@/lib/email';

// This function can be called by a cron job service (like Vercel Cron Jobs or GitHub Actions)
export async function GET() {
  try {
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    // Find certifications that will expire in exactly 90, 30, or 7 days
    const targetExpiryDates = [
      new Date(new Date().setDate(new Date().getDate() + 90))
        .toISOString()
        .split('T')[0],
      new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split('T')[0],
      new Date(new Date().setDate(new Date().getDate() + 7))
        .toISOString()
        .split('T')[0],
    ];

    const certsToExpire = await prisma.employeeCertification.findMany({
      where: {
        // This logic finds certs expiring on our specific target dates
        expiryDate: {
          in: targetExpiryDates.map((d) => new Date(d)),
        },
        status: 'ACTIVE', // Only notify for active certs
      },
      include: {
        user: { select: { name: true, email: true } },
        certification: { select: { name: true } },
      },
    });

    for (const cert of certsToExpire) {
      if (cert.user.email) {
        const emailContent = getExpiresSoonEmail(
          cert.user.name || 'Employee',
          cert.certification.name,
          new Date(cert.expiryDate).toLocaleDateString()
        );
        await sendEmail({ to: cert.user.email, ...emailContent });
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Checked for expiring certs. Found and notified ${certsToExpire.length} users.`,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { ok: false, message: 'Cron job failed.' },
      { status: 500 }
    );
  }
}
