'use client';

import { Certification, User } from '@prisma/client';
import { updateCertification } from '@/app/actions';
import { X } from 'lucide-react';

type Props = {
  cert: Certification;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
};

export default function EditCertificationModal({
  cert,
  users,
  isOpen,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold mb-4">Edit Certification</h2>
        <form
          action={async (formData) => {
            await updateCertification(formData);
            onClose();
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={cert.id} />
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Certification Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field mt-1"
              required
              defaultValue={cert.name}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="input-field mt-1"
              required
              defaultValue={cert.description}
            />
          </div>
          <div>
            <label
              htmlFor="portalMasterIds"
              className="block text-sm font-medium text-gray-700"
            >
              Assign Portal Masters
            </label>
            <p className="text-xs text-gray-500">
              Hold Ctrl/Cmd to select multiple
            </p>
            <select
              id="portalMasterIds"
              name="portalMasterIds"
              multiple
              className="input-field mt-1 h-40"
              defaultValue={cert.portalMasterIds}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
