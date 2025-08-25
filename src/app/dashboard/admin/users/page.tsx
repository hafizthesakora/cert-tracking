import prisma from '@/lib/primsa';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AddUserForm from '@/components/admin/AddUserForm';
import UserManagementClient from '@/components/admin/UserManagementClient';

export default async function ManageUsersPage() {
  // Security check: Ensure only admins can access this page
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all users with a count of their certifications
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { certifications: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Fetch all certifications to be used in the "Assign Certification" dropdown
  const certifications = await prisma.certification.findMany({
    orderBy: { name: 'asc' },
  });

  // Render the page layout, passing the fetched data to the client components
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">Manage Users</h1>
        <p className="text-gray-600 mt-1">
          Create new users, assign roles, and manage certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* User Table Column */}
        <div className="lg:col-span-2">
          <UserManagementClient users={users} certifications={certifications} />
        </div>

        {/* Add User Form Column */}
        <div className="lg:sticky lg:top-24">
          <AddUserForm />
        </div>
      </div>
    </div>
  );
}
