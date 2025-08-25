import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- 1. DEFINE ALL USERS HERE ---
  // To add more users, simply add a new object to this list.
  const usersToCreate = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
    {
      email: 'pm@example.com',
      name: 'Portal Master',
      role: Role.PORTAL_MASTER,
    },
    {
      email: 'employee@example.com',
      name: 'Employee User',
      role: Role.EMPLOYEE,
    },
    // --- Add your new users below this line ---
    // {
    //   email: 'new.user@example.com',
    //   name: 'New User Name',
    //   role: Role.EMPLOYEE,
    // },
  ];

  // --- 2. CREATE ALL USERS ---
  console.log('Creating users...');
  const password = await hash('password123', 12);
  const createdUsers = [];

  for (const userData of usersToCreate) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password,
      },
    });
    createdUsers.push(user);
    console.log(`Created user: ${user.name}`);
  }

  // --- 3. FIND SPECIFIC USERS FOR ASSIGNMENTS ---
  // The script finds the users from the list you provided above.
  const adminUser = createdUsers.find((u) => u.email === 'admin@example.com');
  const portalMasterUser = createdUsers.find(
    (u) => u.email === 'pm@example.com'
  );
  const employeeUser = createdUsers.find(
    (u) => u.email === 'employee@example.com'
  );

  if (!adminUser || !portalMasterUser || !employeeUser) {
    console.error(
      'Could not find the default admin, portal master, or employee user. Aborting certification assignment.'
    );
    return;
  }

  // --- 4. CREATE CERTIFICATIONS ---
  console.log('Creating certifications...');
  const bosiet = await prisma.certification.create({
    data: {
      name: 'BOSIET',
      description: 'Basic Offshore Safety Induction and Emergency Training',
      portalMasterIds: [portalMasterUser.id],
    },
  });

  const pmp = await prisma.certification.create({
    data: {
      name: 'PMP',
      description: 'Project Management Professional',
      portalMasterIds: [adminUser.id],
    },
  });
  console.log('Created certifications.');

  // --- 5. ASSIGN CERTIFICATIONS TO USERS ---
  console.log('Assigning certifications...');
  await prisma.employeeCertification.create({
    data: {
      userId: employeeUser.id,
      certificationId: bosiet.id,
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2026-01-15'),
      status: 'ACTIVE',
    },
  });

  await prisma.employeeCertification.create({
    data: {
      userId: portalMasterUser.id,
      certificationId: bosiet.id,
      issueDate: new Date('2023-11-01'),
      expiryDate: new Date('2025-10-15'),
      status: 'ACTIVE',
    },
  });

  await prisma.employeeCertification.create({
    data: {
      userId: adminUser.id,
      certificationId: pmp.id,
      issueDate: new Date('2022-08-20'),
      expiryDate: new Date('2025-08-19'),
      status: 'ACTIVE',
    },
  });
  console.log('Assigned certifications.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
