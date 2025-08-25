import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/primsa';
import { Role, Status } from '@prisma/client';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import PortalMasterDashboard from '@/components/dashboards/PortalMasterDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

// This function will automatically update the status of certifications based on their expiry date.
async function updateCertificationStatuses() {
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  await prisma.employeeCertification.updateMany({
    where: {
      status: 'ACTIVE',
      expiryDate: { lte: ninetyDaysFromNow, gte: today },
    },
    data: { status: 'EXPIRES_SOON' },
  });

  await prisma.employeeCertification.updateMany({
    where: {
      status: { in: ['ACTIVE', 'EXPIRES_SOON'] },
      expiryDate: { lt: today },
    },
    data: { status: 'EXPIRED' },
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  await updateCertificationStatuses();

  const user = session.user as { id: string; role: Role; name: string };

  switch (user.role) {
    case 'EMPLOYEE': {
      const myCerts = await prisma.employeeCertification.findMany({
        where: { userId: user.id },
        include: { certification: true },
        orderBy: { expiryDate: 'asc' },
      });
      return <EmployeeDashboard certs={myCerts} />;
    }
    case 'PORTAL_MASTER': {
      const managedCerts = await prisma.certification.findMany({
        where: { portalMasterIds: { has: user.id } },
        include: {
          employees: {
            include: { user: { select: { name: true, email: true } } },
            orderBy: { expiryDate: 'asc' },
          },
        },
      });
      return <PortalMasterDashboard managedCerts={managedCerts} />;
    }
    case 'ADMIN': {
      // Fetch all data needed for admin stats
      const [userCount, certCount, expiredCount, renewalRequestCount] =
        await Promise.all([
          prisma.user.count(),
          prisma.certification.count(),
          prisma.employeeCertification.count({ where: { status: 'EXPIRED' } }),
          prisma.employeeCertification.count({
            where: { status: 'RENEWAL_REQUESTED' },
          }),
        ]);

      const allCerts = await prisma.certification.findMany({
        include: {
          employees: {
            include: { user: { select: { name: true, email: true } } },
            orderBy: { expiryDate: 'asc' },
          },
        },
      });
      const allUsers = await prisma.user.findMany({
        select: { id: true, name: true },
      });
      const usersMap = new Map(allUsers.map((u) => [u.id, u.name]));

      const certsWithPMNames = allCerts.map((cert) => ({
        ...cert,
        portalMasters: cert.portalMasterIds.map((id) => ({
          id,
          name: usersMap.get(id) || 'Unknown User',
        })),
      }));

      return (
        <AdminDashboard
          allCerts={certsWithPMNames}
          stats={{ userCount, certCount, expiredCount, renewalRequestCount }}
        />
      );
    }
    default:
      return (
        <div className="card">
          <h1 className="text-xl">Welcome</h1>
          <p>Your role is not defined. Please contact an administrator.</p>
        </div>
      );
  }
}
