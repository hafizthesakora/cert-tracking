import prisma from '@/lib/primsa';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AddCertificationForm from '@/components/admin/AddCertificationForm';
import ManageCertificationsClient from '@/components/admin/ManageCertificationsClient';

// This is a pure async Server Component for fetching data.
export default async function ManageCertificationsPage() {
  // Security check: Ensure only admins can access this page
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all certifications with a count of their assigned employees
  const certifications = await prisma.certification.findMany({
    include: {
      _count: {
        select: { employees: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Fetch all users to populate the "Portal Masters" dropdowns
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });

  // Render the page layout, passing the fetched data to the client components
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">Manage Certifications</h1>
        <p className="text-gray-600 mt-1">
          Create new certifications and edit portal master assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Certifications Table Column */}
        <div className="lg:col-span-2">
          <ManageCertificationsClient certs={certifications} users={users} />
        </div>

        {/* Add Certification Form Column */}
        <div className="lg:sticky lg:top-24">
          <AddCertificationForm users={users} />
        </div>
      </div>
    </div>
  );
}
