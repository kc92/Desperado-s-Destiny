/**
 * User Management Component
 * User administration - ban, unban, search, view details
 */

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/store/useToastStore';
import { logger } from '@/services/logger.service';

export const UserManagement: React.FC = () => {
  const { users, fetchUsers, banUser, unbanUser, fetchUserDetails, isLoading } = useAdminStore();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetUserId, setBanTargetUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadUsers = () => {
    const params: any = {};

    if (searchTerm) params.search = searchTerm;
    if (roleFilter !== 'all') params.role = roleFilter;
    if (statusFilter !== 'all') params.isActive = statusFilter === 'active';

    fetchUsers(params).catch((err) => logger.error('Failed to fetch users for user management', err as Error, { context: 'UserManagement.loadUsers', params }));
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleBan = (userId: string) => {
    setBanTargetUserId(userId);
    setBanReason('');
    setBanModalOpen(true);
  };

  const confirmBan = async () => {
    if (!banTargetUserId || !banReason.trim()) return;

    try {
      await banUser(banTargetUserId, banReason);
      success('User Banned', 'User has been banned successfully');
      setBanModalOpen(false);
      setBanTargetUserId(null);
      setBanReason('');
      loadUsers();
    } catch (error: any) {
      showError('Ban Failed', error.message || 'Failed to ban user');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      success('User Unbanned', 'User has been unbanned successfully');
      loadUsers();
    } catch (error: any) {
      showError('Unban Failed', error.message || 'Failed to unban user');
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const details = await fetchUserDetails(userId);
      setUserDetails(details);
      setSelectedUserId(userId);
    } catch (error) {
      logger.error('Failed to fetch user details', error as Error, { context: 'UserManagement.handleViewDetails', userId });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">User Management</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div>
            <label className="block text-sm text-frontier-silver mb-2">Search Email</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="email@example.com"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-frontier-gold text-frontier-dark rounded-lg hover:bg-frontier-gold-dark transition-colors font-western"
              >
                Search
              </button>
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm text-frontier-silver mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-frontier-silver mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* User List */}
        {isLoading ? (
          <div className="text-frontier-silver">Loading users...</div>
        ) : (
          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="text-center text-frontier-silver py-8">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 bg-frontier-wood rounded-lg hover:bg-frontier-wood-dark transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-frontier-silver font-semibold">{user.email}</span>
                      <span className={`
                        px-2 py-0.5 text-xs rounded font-semibold
                        ${user.role === 'admin'
                          ? 'bg-frontier-gold text-frontier-dark'
                          : 'bg-frontier-silver-dark text-frontier-dark'
                        }
                      `}>
                        {user.role}
                      </span>
                      <span className={`
                        px-2 py-0.5 text-xs rounded font-semibold
                        ${user.isActive
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                        }
                      `}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                      {user.emailVerified && (
                        <span className="px-2 py-0.5 text-xs rounded font-semibold bg-blue-600 text-white">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-frontier-silver-dark mt-1">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                      {user.lastLogin && ` • Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(user._id)}
                      className="px-4 py-2 bg-frontier-silver-dark hover:bg-frontier-silver text-frontier-dark rounded-lg transition-colors font-semibold"
                    >
                      Details
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => handleBan(user._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                      >
                        Ban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnban(user._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                      >
                        Unban
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUserId && userDetails && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-western text-frontier-gold">User Details</h3>
            <button
              onClick={() => {
                setSelectedUserId(null);
                setUserDetails(null);
              }}
              className="px-4 py-2 bg-frontier-wood hover:bg-frontier-wood-dark text-frontier-silver rounded-lg transition-colors"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-frontier-silver mb-2">User Information</h4>
              <div className="bg-frontier-wood p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-frontier-silver-dark">Email</div>
                    <div className="text-frontier-silver">{userDetails.user.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-frontier-silver-dark">Role</div>
                    <div className="text-frontier-silver">{userDetails.user.role}</div>
                  </div>
                  <div>
                    <div className="text-xs text-frontier-silver-dark">Status</div>
                    <div className="text-frontier-silver">
                      {userDetails.user.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-frontier-silver-dark">Email Verified</div>
                    <div className="text-frontier-silver">
                      {userDetails.user.emailVerified ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-frontier-silver mb-2">
                Characters ({userDetails.characters.length})
              </h4>
              <div className="space-y-2">
                {userDetails.characters.map((char: any) => (
                  <div key={char._id} className="bg-frontier-wood p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-frontier-silver font-semibold">{char.name}</div>
                        <div className="text-sm text-frontier-silver-dark">
                          Level {char.level} • {char.faction} • {char.gold.toLocaleString()} gold
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Ban Reason Modal */}
      {banModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-xl font-western text-frontier-gold mb-4">Ban User</h3>
            <p className="text-frontier-silver-dark mb-4">
              Please provide a reason for banning this user:
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason..."
              rows={3}
              className="w-full px-4 py-2 bg-frontier-dark border border-frontier-wood rounded-lg text-frontier-silver mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setBanModalOpen(false);
                  setBanTargetUserId(null);
                  setBanReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmBan}
                disabled={!banReason.trim()}
              >
                Ban User
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
