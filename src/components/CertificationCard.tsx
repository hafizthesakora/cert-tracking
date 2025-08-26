'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Certification, EmployeeCertification } from '@prisma/client';
import { requestRenewal, postponeRenewal } from '@/app/actions';
import StatusBadge from './StatusBadge';
import ActionModal from './ActionModal';
import { Calendar, User as UserIcon } from 'lucide-react';

// --- FIX #1 ---
// The 'certification' object is now required (no '?').
// This guarantees that it will always be passed in from the parent dashboards.
type CertWithDetails = EmployeeCertification & {
  certification: Certification;
};

type Props = {
  cert: CertWithDetails;
  employee?: { name: string | null; email: string | null };
};

export default function CertificationCard({ cert, employee }: Props) {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const isPortalMasterOrAdmin =
    user?.role === 'ADMIN' || user?.role === 'PORTAL_MASTER';

  const [isInitiateModalOpen, setInitiateModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  // --- FIX #2 ---
  // This is now simpler and type-safe because 'cert.certification' is guaranteed to exist.
  const certificationDetails = cert.certification;

  const renderEmployeeActions = () => {
    if (
      ['ACTIVE', 'EXPIRES_SOON', 'POSTPONED', 'EXPIRED'].includes(cert.status)
    ) {
      return (
        <button
          onClick={() => requestRenewal(cert.id)}
          className="btn-primary w-full mt-4"
        >
          Request Renewal
        </button>
      );
    }
    return null;
  };

  const renderPortalMasterActions = () => {
    switch (cert.status) {
      case 'RENEWAL_REQUESTED':
      case 'EXPIRES_SOON':
      case 'EXPIRED':
        return (
          <button
            onClick={() => setInitiateModalOpen(true)}
            className="btn-primary w-full mt-4"
          >
            Initiate Renewal
          </button>
        );
      case 'INITIATED':
        return (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="btn-primary flex-1"
            >
              Confirm
            </button>
            <button
              onClick={() => postponeRenewal(cert.id)}
              className="btn-secondary flex-1"
            >
              Postpone
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="card flex flex-col justify-between h-full">
        <div>
          {employee && (
            <div className="flex items-center text-sm text-gray-600 mb-2 border-b pb-2">
              <UserIcon className="w-4 h-4 mr-2" />
              <span className="font-semibold">{employee.name}</span>
            </div>
          )}
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">
              {certificationDetails.name}
            </h3>
            <StatusBadge status={cert.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {certificationDetails.description}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>
                Expires:{' '}
                <span className="font-medium">
                  {new Date(cert.expiryDate).toLocaleDateString()}
                </span>
              </span>
            </div>
            {cert.status === 'INITIATED' && cert.renewalDate && (
              <div className="flex items-center text-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Renewal On:{' '}
                  <span className="font-medium">
                    {new Date(cert.renewalDate).toLocaleDateString()}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          {isPortalMasterOrAdmin
            ? renderPortalMasterActions()
            : renderEmployeeActions()}
        </div>
      </div>

      {isPortalMasterOrAdmin && (
        <>
          <ActionModal
            isOpen={isInitiateModalOpen}
            onClose={() => setInitiateModalOpen(false)}
            employeeCertId={cert.id}
            actionType="initiate"
          />
          <ActionModal
            isOpen={isConfirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            employeeCertId={cert.id}
            actionType="confirm"
          />
        </>
      )}
    </>
  );
}
