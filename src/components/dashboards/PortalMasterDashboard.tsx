'use client';
import { useState } from 'react';
import {
  Certification as TCertification,
  EmployeeCertification,
  User,
} from '@prisma/client';
import CertificationCard from '@/components/CertificationCard';
import StatCard from '@/components/StatCard';
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

type EmployeeWithUser = EmployeeCertification & {
  user: { name: string | null; email: string | null };
};
type ManagedCert = TCertification & { employees: EmployeeWithUser[] };

const PortalMasterDashboard = ({
  managedCerts,
}: {
  managedCerts: ManagedCert[];
}) => {
  const [selectedCert, setSelectedCert] = useState<ManagedCert | null>(
    managedCerts[0] || null
  );

  // Calculate stats
  const certsManagedCount = managedCerts.length;
  const allEmployeesCerts = managedCerts.flatMap((c) => c.employees);
  const renewalsRequestedCount = allEmployeesCerts.filter(
    (c) => c.status === 'RENEWAL_REQUESTED'
  ).length;
  const expiredCount = allEmployeesCerts.filter(
    (c) => c.status === 'EXPIRED'
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Certs Managed"
          value={certsManagedCount}
          icon={<ClipboardList size={24} />}
          color="blue"
        />
        <StatCard
          title="Renewals Requested"
          value={renewalsRequestedCount}
          icon={<FileText size={24} />}
          color="yellow"
        />
        <StatCard
          title="Total Expired"
          value={expiredCount}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
      </div>
      <div>
        <h1 className="text-2xl mb-6">Portal Master Dashboard</h1>
        {managedCerts.length === 0 ? (
          <div className="card text-center">
            <p>You are not managing any certifications.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <h2 className="text-lg font-medium mb-2">
                Managed Certifications
              </h2>
              <ul className="space-y-2">
                {managedCerts.map((cert) => (
                  <li key={cert.id}>
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCert?.id === cert.id
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {cert.name} ({cert.employees.length})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-3/4">
              {selectedCert ? (
                <div>
                  <h2 className="text-xl mb-4">
                    Employees with:{' '}
                    <span className="font-bold text-blue-700">
                      {selectedCert.name}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {selectedCert.employees.map((empCert) => (
                      <CertificationCard
                        key={empCert.id}
                        cert={empCert}
                        employee={empCert.user}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card text-center">
                  <p>Select a certification to view employees.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalMasterDashboard;
