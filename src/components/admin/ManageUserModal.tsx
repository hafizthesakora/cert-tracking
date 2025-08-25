'use client';

import { User, Certification, Role } from '@prisma/client';
import { updateUserRole, assignCertificationToUser } from '@/app/actions';
import { useRef, useState, useTransition } from 'react';
import {
  X,
  User as UserIcon,
  Crown,
  Shield,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Award,
  Settings,
} from 'lucide-react';

type UserWithCount = User & {
  _count: {
    certifications: number;
  };
};

type Props = {
  user: UserWithCount;
  certifications: Certification[];
  isOpen: boolean;
  onClose: () => void;
};

export default function ManageUserModal({
  user,
  certifications,
  isOpen,
  onClose,
}: Props) {
  const assignCertFormRef = useRef<HTMLFormElement>(null);
  const [isPendingRole, startRoleTransition] = useTransition();
  const [isPendingCert, startCertTransition] = useTransition();
  const [roleStatus, setRoleStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [certStatus, setCertStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleRoleUpdate = async (formData: FormData) => {
    startRoleTransition(async () => {
      try {
        setRoleStatus('idle');
        await updateUserRole(formData);
        setRoleStatus('success');
        setTimeout(() => setRoleStatus('idle'), 2000);
      } catch (error) {
        setRoleStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to update role'
        );
      }
    });
  };

  const handleCertAssignment = async (formData: FormData) => {
    startCertTransition(async () => {
      try {
        setCertStatus('idle');
        await assignCertificationToUser(formData);
        assignCertFormRef.current?.reset();
        setCertStatus('success');
        setTimeout(() => setCertStatus('idle'), 2000);
      } catch (error) {
        setCertStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to assign certification'
        );
      }
    });
  };

  const getRoleIcon = (role: Role) => {
    return role === 'ADMIN' ? (
      <Crown className="h-4 w-4 text-amber-600" />
    ) : (
      <UserIcon className="h-4 w-4 text-blue-600" />
    );
  };

  const getRoleBadgeColor = (role: Role) => {
    return role === 'ADMIN'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getRoleDisplayName = (role: Role) => {
    return role === 'ADMIN' ? 'Administrator' : 'Standard User';
  };

  // Get today's date in YYYY-MM-DD format for date inputs
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-slate-600 rounded-full">
              <span className="text-lg font-bold text-white">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-slate-300">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-900/30 text-amber-300 border-amber-700/30'
                      : 'bg-blue-900/30 text-blue-300 border-blue-700/30'
                  }`}
                >
                  {getRoleIcon(user.role)}
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {/* User Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {user._count.certifications}
                </p>
                <p className="text-sm text-blue-700">Active Certifications</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {user.role === 'ADMIN' ? 'All' : '0'}
                </p>
                <p className="text-sm text-green-700">Portal Access</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <Calendar className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-600">
                  {user.createdAt
                    ? new Date(user.createdAt).getFullYear()
                    : 'N/A'}
                </p>
                <p className="text-sm text-slate-700">Member Since</p>
              </div>
            </div>

            {/* Update Role Section */}
            <div className="border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
                  <Settings className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Change User Role
                </h3>
              </div>

              {roleStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 text-sm font-medium">
                    Role updated successfully!
                  </span>
                </div>
              )}

              {roleStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 text-sm font-medium">
                    {errorMessage}
                  </span>
                </div>
              )}

              <form action={handleRoleUpdate} className="space-y-4">
                <input type="hidden" name="userId" value={user.id} />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Select New Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      defaultValue={user.role}
                      disabled={isPendingRole}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white text-slate-900 appearance-none pr-10"
                    >
                      {Object.values(Role).map((role) => (
                        <option key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPendingRole}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-800 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPendingRole ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Role...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      Update Role
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-xs">
                  <strong>Note:</strong> Administrators have access to all
                  certifications and can manage users. Standard users only have
                  access to their own certifications.
                </p>
              </div>
            </div>

            {/* Assign Certification Section */}
            <div className="border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Assign New Certification
                </h3>
              </div>

              {certStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 text-sm font-medium">
                    Certification assigned successfully!
                  </span>
                </div>
              )}

              {certStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 text-sm font-medium">
                    {errorMessage}
                  </span>
                </div>
              )}

              {certifications.length > 0 ? (
                <form
                  ref={assignCertFormRef}
                  action={handleCertAssignment}
                  className="space-y-4"
                >
                  <input type="hidden" name="userId" value={user.id} />

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Select Certification
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-slate-400" />
                      </div>
                      <select
                        name="certificationId"
                        required
                        defaultValue=""
                        disabled={isPendingCert}
                        className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-slate-900 appearance-none"
                      >
                        <option value="" disabled>
                          Choose a certification...
                        </option>
                        {certifications.map((cert) => (
                          <option key={cert.id} value={cert.id}>
                            {cert.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Issue Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          name="issueDate"
                          max={today}
                          required
                          disabled={isPendingCert}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Expiry Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          name="expiryDate"
                          min={today}
                          required
                          disabled={isPendingCert}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPendingCert}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPendingCert ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Assigning Certification...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Assign Certification
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    No Certifications Available
                  </p>
                  <p className="text-slate-500 text-sm">
                    Create certifications first before assigning them to users.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
