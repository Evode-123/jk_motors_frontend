import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Edit, Search, Filter, X, Mail, Shield, CheckCircle, XCircle, Loader } from 'lucide-react';
import apiService from '../../services/apiService';
import { USER_ROLES } from '../../utils/constants';

// ── JK Theme primitives ───────────────────────────────────────────────────────

const T = {
  heading: { fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0' },
  body:    { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' },
  muted:   { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b' },
  label:   { fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 },
};

const JKCard = ({ children, style = {} }) => (
  <div style={{ background: 'rgba(30,61,110,0.4)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16, overflow: 'hidden', ...style }}>{children}</div>
);

const JKInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && <Icon className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />}
    <input {...props} style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)', color: '#e2e8f0', borderRadius: 12, padding: `10px ${Icon ? '16px 10px 38px' : '16px'}`, fontSize: 14, width: '100%', fontFamily: "'Space Grotesk', sans-serif", outline: 'none' }} />
  </div>
);

const JKSelect = ({ icon: Icon, children, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && <Icon className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 1 }} />}
    <select {...props} style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)', color: '#e2e8f0', borderRadius: 12, padding: `10px 16px 10px ${Icon ? '38px' : '16px'}`, fontSize: 14, width: '100%', fontFamily: "'Space Grotesk', sans-serif", outline: 'none', appearance: 'none' }}>
      {children}
    </select>
  </div>
);

const ModalShell = ({ title, onClose, children, disabled }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
    <div style={{ background: 'linear-gradient(160deg,#0F2644,#1E3D6E)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(14,165,233,0.15)' }}>
        <h3 style={{ ...T.heading, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={!disabled ? onClose : undefined} disabled={disabled}
          style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 6, cursor: disabled ? 'not-allowed' : 'pointer', color: '#94a3b8', opacity: disabled ? 0.4 : 1 }}><X className="w-4 h-4" /></button>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const AdminUserManagement = () => {
  const [users, setUsers]                   = useState([]);
  const [filteredUsers, setFilteredUsers]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedRole, setSelectedRole]     = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingUser,  setEditingUser]  = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', role: USER_ROLES.CLIENT });
  const [editForm,   setEditForm]   = useState({ email: '', role: '', isEnabled: true });

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = [...users];
    if (searchTerm) result = result.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedRole !== 'ALL')   result = result.filter(u => u.role === selectedRole);
    if (selectedStatus !== 'ALL') result = result.filter(u => selectedStatus === 'ACTIVE' ? u.isEnabled : !u.isEnabled);
    setFilteredUsers(result);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  const fetchUsers = async () => {
    setLoading(true); setError('');
    try { const data = await apiService.getAllUsers(); setUsers(data); setFilteredUsers(data); }
    catch (err) { setError('Failed to fetch users: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setCreatingUser(true);
    try {
      await apiService.createUser(createForm);
      setSuccess('User created! Credentials sent via email.');
      setShowCreateModal(false); setCreateForm({ email: '', role: USER_ROLES.CLIENT });
      fetchUsers(); setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setError(err.message); }
    finally { setCreatingUser(false); }
  };

  const handleEditUser = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setEditingUser(true);
    try {
      await apiService.manageUser({ email: editForm.email, role: editForm.role, isEnabled: editForm.isEnabled });
      setSuccess('User updated successfully!');
      setShowEditModal(false); setSelectedUser(null);
      fetchUsers(); setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setError(err.message); }
    finally { setEditingUser(false); }
  };

  const handleDisableUser = async () => {
    setError(''); setSuccess(''); setDeletingUser(true);
    try {
      await apiService.manageUser({ email: selectedUser.email, isEnabled: false });
      setSuccess('User disabled successfully!');
      setShowDeleteModal(false); setSelectedUser(null);
      fetchUsers(); setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setError(err.message); }
    finally { setDeletingUser(false); }
  };

  const openEditModal = (user) => {
    setSelectedUser(user); setEditForm({ email: user.email, role: user.role, isEnabled: user.isEnabled }); setShowEditModal(true);
  };

  const thStyle = { ...T.label, padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid rgba(14,165,233,0.1)', display: 'table-cell', marginBottom: 0 };
  const tdStyle = { padding: '14px 20px', borderBottom: '1px solid rgba(14,165,233,0.06)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#e2e8f0' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto" style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
        <p style={{ ...T.muted, marginTop: 16, fontSize: 13 }}>Loading users...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ ...T.heading, fontSize: 22, fontWeight: 900 }}>User Management</h1>
          <p style={{ ...T.muted, fontSize: 13, marginTop: 4 }}>Manage system users and their roles</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      {success && (
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
          <span style={{ ...T.body, fontSize: 13 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7' }}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <span style={{ ...T.body, fontSize: 13 }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <JKCard style={{ padding: 16 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <JKInput icon={Search} type="text" placeholder="Search by email or name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <JKSelect icon={Filter} value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            <option value="ALL" style={{ background: '#1E3A58' }}>All Roles</option>
            <option value={USER_ROLES.ADMIN} style={{ background: '#1E3A58' }}>Admin</option>
            <option value={USER_ROLES.CLIENT} style={{ background: '#1E3A58' }}>Client</option>
          </JKSelect>
          <JKSelect icon={Shield} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL" style={{ background: '#1E3A58' }}>All Status</option>
            <option value="ACTIVE" style={{ background: '#1E3A58' }}>Active</option>
            <option value="DISABLED" style={{ background: '#1E3A58' }}>Disabled</option>
          </JKSelect>
        </div>
        <p style={{ ...T.muted, fontSize: 12, marginTop: 12 }}>Showing {filteredUsers.length} of {users.length} users</p>
      </JKCard>

      {/* Table */}
      <JKCard>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Role', 'Status', 'Email Verified', 'Profile', 'Actions'].map(h => (
                  <th key={h} style={{ ...thStyle, textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ ...T.muted, textAlign: 'center', padding: '48px 0', fontSize: 13 }}>No users found</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(14,165,233,0.2),rgba(99,102,241,0.2))', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User className="w-4 h-4" style={{ color: '#38bdf8' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: user.role === USER_ROLES.ADMIN ? 'rgba(239,68,68,0.12)' : 'rgba(14,165,233,0.1)', color: user.role === USER_ROLES.ADMIN ? '#f87171' : '#38bdf8', border: `1px solid ${user.role === USER_ROLES.ADMIN ? 'rgba(239,68,68,0.2)' : 'rgba(14,165,233,0.2)'}` }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {user.isEnabled
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6ee7b7', fontSize: 12 }}><CheckCircle className="w-4 h-4" />Active</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f87171', fontSize: 12 }}><XCircle className="w-4 h-4" />Disabled</span>
                    }
                  </td>
                  <td style={tdStyle}>
                    {user.isEmailVerified
                      ? <span style={{ color: '#6ee7b7', fontSize: 12 }}>✓ Verified</span>
                      : <span style={{ color: '#fcd34d', fontSize: 12 }}>⚠ Unverified</span>
                    }
                  </td>
                  <td style={tdStyle}>
                    {user.profileCompleted
                      ? <span style={{ color: '#6ee7b7', fontSize: 12 }}>✓ Completed</span>
                      : <span style={{ color: '#fcd34d', fontSize: 12 }}>⚠ Incomplete</span>
                    }
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => openEditModal(user)} title="Edit"
                        style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#38bdf8' }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} title="Disable"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#f87171' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </JKCard>

      {/* Create Modal */}
      {showCreateModal && (
        <ModalShell title="Create New User" onClose={() => !creatingUser && setShowCreateModal(false)} disabled={creatingUser}>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={T.label}>Email Address</label>
              <JKInput icon={Mail} type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="user@example.com" required disabled={creatingUser} />
            </div>
            <div>
              <label style={T.label}>Role</label>
              <JKSelect value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} disabled={creatingUser}>
                <option value={USER_ROLES.CLIENT} style={{ background: '#1E3A58' }}>Client</option>
                <option value={USER_ROLES.ADMIN} style={{ background: '#1E3A58' }}>Admin</option>
              </JKSelect>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', fontSize: 12, color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}>
              ℹ️ A random password will be generated and sent to the user's email.
            </div>
            {creatingUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Loader className="w-4 h-4 animate-spin" style={{ color: '#fcd34d' }} />
                <p style={{ ...T.muted, fontSize: 12 }}>Creating user and sending credentials...</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowCreateModal(false)} disabled={creatingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(14,165,233,0.2)', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: creatingUser ? 0.5 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={creatingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: creatingUser ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {creatingUser ? <><Loader className="w-4 h-4 animate-spin" />Creating...</> : 'Create User'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <ModalShell title="Edit User" onClose={() => !editingUser && setShowEditModal(false)} disabled={editingUser}>
          <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={T.label}>Email Address</label>
              <input type="email" value={editForm.email} disabled
                style={{ background: 'rgba(14,165,233,0.02)', border: '1px solid rgba(14,165,233,0.1)', color: '#64748b', borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%', fontFamily: "'Space Grotesk', sans-serif", outline: 'none' }} />
            </div>
            <div>
              <label style={T.label}>Role</label>
              <JKSelect value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} disabled={editingUser}>
                <option value={USER_ROLES.CLIENT} style={{ background: '#1E3A58' }}>Client</option>
                <option value={USER_ROLES.ADMIN} style={{ background: '#1E3A58' }}>Admin</option>
              </JKSelect>
            </div>
            <div>
              <label style={T.label}>Account Status</label>
              <div style={{ display: 'flex', gap: 20 }}>
                {[{ val: true, l: 'Active' }, { val: false, l: 'Disabled' }].map(opt => (
                  <label key={opt.l} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={editForm.isEnabled === opt.val} onChange={() => setEditForm({ ...editForm, isEnabled: opt.val })} disabled={editingUser} style={{ width: 16, height: 16 }} />
                    <span style={{ ...T.body, fontSize: 13 }}>{opt.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowEditModal(false)} disabled={editingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(14,165,233,0.2)', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: editingUser ? 0.5 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={editingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: editingUser ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {editingUser ? <><Loader className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* Disable Modal */}
      {showDeleteModal && selectedUser && (
        <ModalShell title="Disable User" onClose={() => !deletingUser && setShowDeleteModal(false)} disabled={deletingUser}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 className="w-7 h-7" style={{ color: '#f87171' }} />
            </div>
            <p style={{ ...T.body, fontSize: 14 }}>Are you sure you want to disable <strong>{selectedUser.email}</strong>?</p>
            <p style={{ ...T.muted, fontSize: 12, marginTop: 6 }}>The user will not be able to log in until reactivated.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowDeleteModal(false)} disabled={deletingUser}
              style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(14,165,233,0.2)', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deletingUser ? 0.5 : 1 }}>
              Cancel
            </button>
            <button onClick={handleDisableUser} disabled={deletingUser}
              style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deletingUser ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {deletingUser ? <><Loader className="w-4 h-4 animate-spin" />Disabling...</> : 'Disable User'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default AdminUserManagement;