import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, Trash2, Edit2, CheckCircle2, XCircle, Coins, Users } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { IUser, UserRole } from '../../types';

export const UserManagementPage: React.FC = () => {
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

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (selectedRole !== 'all') query.append('role', selectedRole);
      if (selectedStatus !== 'all') query.append('status', selectedStatus);

      const res = await api.get(`/admin/users?${query.toString()}`);
      if (res.data.success) {
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

      if (res.data.success) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete user '${name}'? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/admin/users/${id}`);
        if (res.data.success) {
          fetchUsers();
        }
      } catch (err: any) {
        alert(err.message || 'Error deleting user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Admin User Management"
        subtitle="Review community members, regulate account permissions, and grant credit adjustments"
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Search & Filter Controls */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, email or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
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
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table Card */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <h4 className="font-bold text-stone-900">{u.name}</h4>
                          <p className="text-[11px] text-stone-400">{u.email}</p>
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

                    <td className="py-3.5 font-bold text-action">
                      {u.credits} Credits
                    </td>

                    <td className="py-3.5">
                      <span className="font-bold text-stone-800">{u.rating || 5.0} ★</span>
                      <span className="text-[10px] text-stone-400 ml-1.5">({u.reputationScore} Rep)</span>
                    </td>

                    <td className="py-3.5">
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

                    <td className="py-3.5 text-right space-x-1">
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
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
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
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Account Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
            >
              <option value="learner">Learner</option>
              <option value="mentor">Mentor</option>
              <option value="learner_mentor">Learner + Mentor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Learning Credits Balance</label>
            <input
              type="number"
              value={editCredits}
              onChange={(e) => setEditCredits(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Account Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
            >
              <option value="active">Active (Access Granted)</option>
              <option value="inactive">Inactive (Suspended)</option>
            </select>
          </div>

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
    </div>
  );
};

