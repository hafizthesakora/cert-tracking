'use client';
import { useState, useMemo } from 'react';
import {
  Certification as TCertification,
  EmployeeCertification,
  User,
} from '@prisma/client';
import CertificationCard from '@/components/CertificationCard';
import StatCard from '@/components/StatCard';
import {
  Users,
  Shield,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
} from 'lucide-react';

type EmployeeWithUser = EmployeeCertification & {
  user: { name: string | null; email: string | null };
};
type CertWithRelations = TCertification & {
  employees: EmployeeWithUser[];
  portalMasters: { id: string; name: string | null }[];
};

type AdminStats = {
  userCount: number;
  certCount: number;
  expiredCount: number;
  renewalRequestCount: number;
};

const AdminDashboard = ({
  allCerts,
  stats,
}: {
  allCerts: CertWithRelations[];
  stats: AdminStats;
}) => {
  const [selectedCert, setSelectedCert] = useState<CertWithRelations | null>(
    allCerts[0] || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'expired' | 'expiring'
  >('all');

  // Filter certifications based on search and status
  const filteredCerts = useMemo(() => {
    let filtered = allCerts;

    if (searchTerm) {
      filtered = filtered.filter((cert) =>
        cert.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((cert) => {
        const now = new Date();
        const hasExpired = cert.employees.some(
          (emp) => emp.expirationDate && new Date(emp.expirationDate) < now
        );
        const isExpiringSoon = cert.employees.some(
          (emp) =>
            emp.expirationDate &&
            new Date(emp.expirationDate) > now &&
            new Date(emp.expirationDate) <=
              new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        );

        switch (filterStatus) {
          case 'expired':
            return hasExpired;
          case 'expiring':
            return isExpiringSoon;
          case 'active':
            return !hasExpired && !isExpiringSoon;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allCerts, searchTerm, filterStatus]);

  // Calculate certification status counts
  const certStatusCounts = useMemo(() => {
    const now = new Date();
    let active = 0;
    let expired = 0;
    let expiring = 0;

    selectedCert?.employees.forEach((emp) => {
      if (emp.expirationDate) {
        const expDate = new Date(emp.expirationDate);
        if (expDate < now) {
          expired++;
        } else if (
          expDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        ) {
          expiring++;
        } else {
          active++;
        }
      } else {
        active++;
      }
    });

    return { active, expired, expiring };
  }, [selectedCert]);

  const getStatusColor = (empCert: EmployeeWithUser) => {
    if (!empCert.expirationDate) return 'text-slate-500';

    const now = new Date();
    const expDate = new Date(empCert.expirationDate);

    if (expDate < now) return 'text-red-600';
    if (expDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
      return 'text-amber-600';
    return 'text-green-600';
  };

  const getStatusIcon = (empCert: EmployeeWithUser) => {
    if (!empCert.expirationDate) return <Clock className="h-4 w-4" />;

    const now = new Date();
    const expDate = new Date(empCert.expirationDate);

    if (expDate < now) return <XCircle className="h-4 w-4" />;
    if (expDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
      return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{stats.userCount}</p>
              <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Active system users
              </p>
            </div>
            <div className="bg-blue-400/30 p-3 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Certifications
              </p>
              <p className="text-3xl font-bold">{stats.certCount}</p>
              <p className="text-green-100 text-xs mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Available cert types
              </p>
            </div>
            <div className="bg-green-400/30 p-3 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">
                Renewal Requests
              </p>
              <p className="text-3xl font-bold">{stats.renewalRequestCount}</p>
              <p className="text-amber-100 text-xs mt-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Pending approvals
              </p>
            </div>
            <div className="bg-amber-400/30 p-3 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Expired Certs</p>
              <p className="text-3xl font-bold">{stats.expiredCount}</p>
              <p className="text-red-100 text-xs mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Require attention
              </p>
            </div>
            <div className="bg-red-400/30 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">
              Certification Overview
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {allCerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-slate-100 p-4 rounded-full">
                  <Shield className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    No Certifications Found
                  </h3>
                  <p className="text-slate-600">
                    No certifications have been created in the system yet.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search certifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Certification List */}
                <div className="lg:w-1/3">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                      Certifications ({filteredCerts.length})
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredCerts.map((cert) => (
                        <button
                          key={cert.id}
                          onClick={() => setSelectedCert(cert)}
                          className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                            selectedCert?.id === cert.id
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-medium truncate ${
                                  selectedCert?.id === cert.id
                                    ? 'text-blue-900'
                                    : 'text-slate-900'
                                }`}
                              >
                                {cert.name}
                              </h3>
                              <p className="text-sm text-slate-600 mt-1">
                                {cert.employees.length} employee
                                {cert.employees.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <ChevronRight
                              className={`h-4 w-4 ${
                                selectedCert?.id === cert.id
                                  ? 'text-blue-600'
                                  : 'text-slate-400'
                              }`}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Certification Details */}
                <div className="lg:w-2/3">
                  {selectedCert ? (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedCert.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            {selectedCert.employees.length} employees
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Portal Masters:{' '}
                            {selectedCert.portalMasters
                              .map((pm) => pm.name)
                              .join(', ') || 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Status Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">
                              Active
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {certStatusCounts.active}
                          </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <span className="font-semibold text-amber-900">
                              Expiring
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-amber-600 mt-1">
                            {certStatusCounts.expiring}
                          </p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-red-900">
                              Expired
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-red-600 mt-1">
                            {certStatusCounts.expired}
                          </p>
                        </div>
                      </div>

                      {/* Employee Cards Grid */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Employee Certifications
                        </h3>
                        {selectedCert.employees.length > 0 ? (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {selectedCert.employees.map((empCert) => (
                              <div
                                key={empCert.id}
                                className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 truncate">
                                      {empCert.user.name || 'Unknown User'}
                                    </h4>
                                    <p className="text-sm text-slate-600 truncate">
                                      {empCert.user.email}
                                    </p>
                                    {empCert.expirationDate && (
                                      <p className="text-sm text-slate-600 mt-1">
                                        Expires:{' '}
                                        {new Date(
                                          empCert.expirationDate
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 ${getStatusColor(
                                      empCert
                                    )}`}
                                  >
                                    {getStatusIcon(empCert)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-slate-600">
                              No employees have this certification yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-slate-100 p-4 rounded-full">
                          <Eye className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Select a Certification
                          </h3>
                          <p className="text-slate-600">
                            Choose a certification from the list to view
                            employee details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
