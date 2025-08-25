import { EmployeeCertification, Certification, Status } from '@prisma/client';
import CertificationCard from '@/components/CertificationCard';
import StatCard from '@/components/StatCard';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

type CertWithDetails = EmployeeCertification & {
  certification: Certification;
};

const EmployeeDashboard = ({ certs }: { certs: CertWithDetails[] }) => {
  // Calculate stats
  const activeCount = certs.filter((c) => c.status === 'ACTIVE').length;
  const expiringSoonCount = certs.filter(
    (c) => c.status === 'EXPIRES_SOON'
  ).length;
  const expiredCount = certs.filter((c) => c.status === 'EXPIRED').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Certs"
          value={activeCount}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          icon={<Clock size={24} />}
          color="yellow"
        />
        <StatCard
          title="Expired"
          value={expiredCount}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
      </div>
      <div>
        <h1 className="text-2xl mb-6">My Certifications</h1>
        {certs.length === 0 ? (
          <div className="card text-center">
            <p>You have no assigned certifications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
