'use client';

import { useState, useMemo } from 'react';
import { Certification, User } from '@prisma/client';
import EditCertificationModal from './EditCertificationModal';
import { Shield, UserCheck, Edit, Search } from 'lucide-react';

type CertWithCount = Certification & {
  _count: {
    employees: number;
  };
};

type Props = {
  certs: CertWithCount[];
  users: User[];
};

export default function ManageCertificationsClient({ certs, users }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertWithCount | null>(null);

  const usersMap = useMemo(
    () => new Map(users.map((u) => [u.id, u.name])),
    [users]
  );

  const filteredCerts = useMemo(() => {
    if (!searchQuery) return certs;
    return certs.filter(
      (cert) =>
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, certs]);

  const handleEditClick = (cert: CertWithCount) => {
    setSelectedCert(cert);
  };

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">
            All Certifications ({certs.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search certifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portal Masters
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCerts.map((cert) => {
                const portalMasterNames = cert.portalMasterIds
                  .map((id) => usersMap.get(id) || 'Unknown')
                  .join(', ');

                return (
                  <tr key={cert.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cert.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Shield className="w-4 h-4 mr-1.5 text-gray-400" />
                        {cert._count.employees} Employees
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {portalMasterNames || 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(cert)}
                        className="btn-secondary"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCert && (
        <EditCertificationModal
          cert={selectedCert}
          users={users}
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </>
  );
}
