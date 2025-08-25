'use client';

import { User, Certification, Role } from '@prisma/client';
import { updateUserRole, assignCertificationToUser } from '@/app/actions';
import { useRef } from 'react';

type UserWithCount = User & {
  _count: {
    certifications: number;
  };
};

type Props = {
  user: UserWithCount;
  certifications: Certification[];
};

export default function UserCard({ user, certifications }: Props) {
  const assignCertFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="card space-y-4 divide-y divide-gray-200">
      {/* User Info Section */}
      <div>
        <h3 className="font-bold text-lg">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-sm text-gray-600 mt-1">
          Current Certs:{' '}
          <span className="font-semibold">{user._count.certifications}</span>
        </p>
      </div>

      {/* Update Role Form */}
      <div className="pt-4">
        <h4 className="font-medium text-md mb-2">Change Role</h4>
        <form action={updateUserRole} className="flex items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <select
            name="role"
            defaultValue={user.role}
            className="input-field flex-grow"
          >
            {Object.values(Role).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Save
          </button>
        </form>
      </div>

      {/* Assign Certification Form */}
      <div className="pt-4">
        <h4 className="font-medium text-md mb-2">Assign New Certification</h4>
        <form
          ref={assignCertFormRef}
          action={async (formData) => {
            await assignCertificationToUser(formData);
            assignCertFormRef.current?.reset();
          }}
          className="space-y-3"
        >
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label className="text-sm font-medium text-gray-700">
              Certification
            </label>
            <select
              name="certificationId"
              className="input-field mt-1"
              required
            >
              <option value="">Select a cert...</option>
              {certifications.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                className="input-field mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                className="input-field mt-1"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            Assign
          </button>
        </form>
      </div>
    </div>
  );
}
