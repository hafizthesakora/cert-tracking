'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/primsa';
import { Role } from '@prisma/client';
import { hash } from 'bcrypt';
import {
  sendEmail,
  getRenewalRequestedEmail,
  getRenewalInitiatedEmail,
  getRenewalConfirmedEmail,
  getRenewalPostponedEmail,
} from '@/lib/email';

// Helper function to get user and cert details for emails
async function getEmailContext(employeeCertId: string) {
  const certData = await prisma.employeeCertification.findUnique({
    where: { id: employeeCertId },
    include: {
      user: { select: { name: true, email: true } },
      certification: {
        select: { name: true, portalMasterIds: true },
      },
    },
  });

  if (!certData || !certData.user.email) return null;

  const portalMasters = await prisma.user.findMany({
    where: { id: { in: certData.certification.portalMasterIds } },
    select: { name: true, email: true },
  });

  return { certData, portalMasters };
}

// Action for an Employee to request renewal
export async function requestRenewal(employeeCertId: string) {
  const context = await getEmailContext(employeeCertId);
  if (context) {
    const { certData, portalMasters } = context;
    // Notify all portal masters
    for (const pm of portalMasters) {
      if (pm.email) {
        const emailContent = getRenewalRequestedEmail(
          certData.user.name || 'Employee',
          certData.certification.name,
          pm.name || 'Portal Master'
        );
        await sendEmail({ to: pm.email, ...emailContent });
      }
    }
  }

  await prisma.employeeCertification.update({
    where: { id: employeeCertId },
    data: { status: 'RENEWAL_REQUESTED' },
  });
  revalidatePath('/dashboard');
}

// Action for a Portal Master/Admin to initiate the renewal process
export async function initiateRenewal(formData: FormData) {
  const employeeCertId = formData.get('employeeCertId') as string;
  const renewalDate = new Date(formData.get('renewalDate') as string);

  // --- EMAIL LOGIC UPDATED ---
  const context = await getEmailContext(employeeCertId);
  if (context) {
    const { certData } = context;
    // Send email to the certificate holder
    const emailContent = getRenewalInitiatedEmail(
      certData.user.name || 'Employee',
      certData.certification.name,
      renewalDate.toLocaleDateString()
    );
    await sendEmail({ to: certData.user.email!, ...emailContent });
  }

  await prisma.employeeCertification.update({
    where: { id: employeeCertId },
    data: { status: 'INITIATED', renewalDate },
  });
  revalidatePath('/dashboard');
}

// Action for a Portal Master/Admin to confirm a renewal
export async function confirmRenewal(formData: FormData) {
  const employeeCertId = formData.get('employeeCertId') as string;
  const newIssueDate = new Date(formData.get('issueDate') as string);
  const newExpiryDate = new Date(formData.get('expiryDate') as string);

  // --- EMAIL LOGIC UPDATED ---
  const context = await getEmailContext(employeeCertId);
  if (context) {
    const { certData } = context;
    // Send email to the certificate holder
    const emailContent = getRenewalConfirmedEmail(
      certData.user.name || 'Employee',
      certData.certification.name,
      newExpiryDate.toLocaleDateString()
    );
    await sendEmail({ to: certData.user.email!, ...emailContent });
  }

  await prisma.employeeCertification.update({
    where: { id: employeeCertId },
    data: {
      status: 'ACTIVE',
      issueDate: newIssueDate,
      expiryDate: newExpiryDate,
      renewalDate: null,
    },
  });
  revalidatePath('/dashboard');
}

// Action for a Portal Master/Admin to postpone a renewal
export async function postponeRenewal(employeeCertId: string) {
  // --- EMAIL LOGIC UPDATED ---
  const context = await getEmailContext(employeeCertId);
  if (context) {
    const { certData } = context;
    // Send email to the certificate holder
    const emailContent = getRenewalPostponedEmail(
      certData.user.name || 'Employee',
      certData.certification.name
    );
    await sendEmail({ to: certData.user.email!, ...emailContent });
  }

  await prisma.employeeCertification.update({
    where: { id: employeeCertId },
    data: { status: 'POSTPONED', renewalDate: null },
  });
  revalidatePath('/dashboard');
}

// --- ALL OTHER ACTIONS REMAIN THE SAME ---

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;
  if (!name || !email || !role) {
    throw new Error('Name, email, and role are required.');
  }
  const password = await hash('password123', 12);
  await prisma.user.create({ data: { name, email, role, password } });
  revalidatePath('/dashboard/admin/users');
}

export async function createCertification(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const portalMasterIds = formData.getAll('portalMasterIds') as string[];
  if (!name || !description) {
    throw new Error('Name and description are required.');
  }
  await prisma.certification.create({
    data: { name, description, portalMasterIds },
  });
  revalidatePath('/dashboard/admin/certifications');
}

export async function updateCertification(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const portalMasterIds = formData.getAll('portalMasterIds') as string[];
  if (!id || !name || !description) {
    throw new Error('ID, Name and description are required.');
  }
  await prisma.certification.update({
    where: { id },
    data: { name, description, portalMasterIds },
  });
  revalidatePath('/dashboard/admin/certifications');
}

export async function updateUserRole(formData: FormData) {
  const userId = formData.get('userId') as string;
  const role = formData.get('role') as Role;
  if (!userId || !role) {
    throw new Error('User ID and role are required.');
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/dashboard/admin/users');
}

export async function assignCertificationToUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  const certificationId = formData.get('certificationId') as string;
  const issueDate = formData.get('issueDate') as string;
  const expiryDate = formData.get('expiryDate') as string;
  if (!userId || !certificationId || !issueDate || !expiryDate) {
    throw new Error('All fields are required for assignment.');
  }
  await prisma.employeeCertification.create({
    data: {
      userId,
      certificationId,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      status: 'ACTIVE',
    },
  });
  revalidatePath('/dashboard/admin/users');
}
