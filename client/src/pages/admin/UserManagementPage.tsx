import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { IUser, UserRole } from '../../types';

export const UserManagementPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('learner_mentor');
  const [editCredits, setEditCredits] = useState<number>(30);
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  // Delete User Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (selectedRole !== 'all') query.append('role', selectedRole);
      if (selectedStatus !== 'all') query.append('status', selectedStatus);

      const res = await api.get(`/admin/users?${query.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, selectedRole, selectedStatus]);

  const handleOpenEdit = (user: IUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditCredits(user.credits);
    setEditStatus(user.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await api.put(`/admin/users/${editingUser._id}`, {
        role: editRole,
        credits: editCredits,
        status: editStatus,
      });

      if (res.data?.success) {
        toastSuccess(`Updated settings for ${editingUser.name}`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      toastError(err.message || 'Error updating user');
    }
  };

  const handlePromptDelete = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await api.delete(`/admin/users/${userToDelete.id}`);
      if (res.data?.success) {
        toastSuccess(`User ${userToDelete.name} permanently deleted.`);
        fetchUsers();
      }
    } catch (err: any) {
      toastError(err.message || 'Error deleting user');
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Admin User Management"
        subtitle="Review community members, regulate account permissions, and grant credit adjustments"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/admin' },
            { label: 'User Management' },
          ]}
        />

        {/* Search & Filter Controls */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, email or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Roles</option>
              <option value="learner">Learners</option>
              <option value="mentor">Mentors</option>
              <option value="learner_mentor">Learner + Mentor</option>
              <option value="admin">Administrators</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table Card */}
        <Card className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-stone-200/80 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Credits</th>
                  <th className="pb-3">Rating / Rep</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.avatar}
                            name={u.name}
                            size="md"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-stone-900 truncate">{u.name}</h4>
                            <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <Badge
                          variant={
                            u.role === 'admin'
                              ? 'purple'
                              : u.role === 'mentor'
                              ? 'forest'
                              : u.role === 'learner'
                              ? 'blue'
                              : 'orange'
                          }
                          size="sm"
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 font-bold text-action whitespace-nowrap">
                        {u.credits} Credits
                      </td>

                      <td className="py-3.5 whitespace-nowrap">
                        <span className="font-bold text-stone-800">{u.rating || 5.0} ★</span>
                        <span className="text-[10px] text-stone-400 ml-1.5">({u.reputationScore} Rep)</span>
                      </td>

                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(u)}
                          title="Edit user details"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDelete(u._id, u.name)}
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Select
            label="Account Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
            options={[
              { value: 'learner', label: 'Learner' },
              { value: 'mentor', label: 'Mentor' },
              { value: 'learner_mentor', label: 'Learner + Mentor' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          <Input
            label="Learning Credits Balance"
            type="number"
            value={editCredits}
            onChange={(e) => setEditCredits(Number(e.target.value))}
          />

          <Select
            label="Account Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
            options={[
              { value: 'active', label: 'Active (Access Granted)' },
              { value: 'inactive', label: 'Inactive (Suspended)' },
            ]}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Permanently Delete User"
        message={`Are you sure you want to permanently delete user '${userToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};
