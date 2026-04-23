import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Edit, Search, Filter, X, Mail, Shield, CheckCircle, XCircle, Loader } from 'lucide-react';
import apiService from '../../services/apiService';
import { USER_ROLES } from '../../utils/constants';

const G = {
  gold:        '#C9A84C',
  goldLight:   '#E8C96A',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.09)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
  surface:     'rgba(28,22,9,0.6)',
  bg:          '#0A0804',
};

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };

const JKCard = ({ children, style = {} }) => (
  <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const JKInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.textMuted, pointerEvents: 'none', zIndex: 1 }} />
    )}
    <input
      {...props}
      style={{
        background: 'rgba(20,16,8,0.8)',
        border: `1px solid ${G.goldDim}`,
        color: G.textPrimary,
        borderRadius: 12,
        padding: `10px ${Icon ? '16px 10px 38px' : '16px'}`,
        fontSize: 14,
        width: '100%',
        ...FONT,
        outline: 'none',
      }}
    />
  </div>
);

const JKSelect = ({ icon: Icon, children, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.textMuted, pointerEvents: 'none', zIndex: 1 }} />
    )}
    <select
      {...props}
      style={{
        background: 'rgba(20,16,8,0.8)',
        border: `1px solid ${G.goldDim}`,
        color: G.textPrimary,
        borderRadius: 12,
        padding: `10px 16px 10px ${Icon ? '38px' : '16px'}`,
        fontSize: 14,
        width: '100%',
        ...FONT,
        outline: 'none',
        appearance: 'none',
      }}
    >
      {children}
    </select>
  </div>
);

const ModalShell = ({ title, onClose, children, disabled }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}>
    <div style={{ background: 'linear-gradient(160deg,#100D05,#1C1609)', border: `1px solid ${G.goldDim}`, borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${G.border}` }}>
        <h3 style={{ ...SERIF, fontSize: 16, fontWeight: 700, color: G.textPrimary }}>{title}</h3>
        <button
          onClick={!disabled ? onClose : undefined}
          disabled={disabled}
          style={{ background: G.goldDimmer, border: `1px solid ${G.border}`, borderRadius: 8, padding: 6, cursor: disabled ? 'not-allowed' : 'pointer', color: G.textMuted, opacity: disabled ? 0.4 : 1 }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  </div>
);

const AdminUserManagement = () => {
  const [users, setUsers]                     = useState([]);
  const [filteredUsers, setFilteredUsers]     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedRole, setSelectedRole]       = useState('ALL');
  const [selectedStatus, setSelectedStatus]   = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [creatingUser, setCreatingUser]       = useState(false);
  const [editingUser, setEditingUser]         = useState(false);
  const [deletingUser, setDeletingUser]       = useState(false);
  const [createForm, setCreateForm]           = useState({ email: '', role: USER_ROLES.CLIENT });
  const [editForm, setEditForm]               = useState({ email: '', role: '', isEnabled: true });

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = [...users];
    if (searchTerm) result = result.filter(u =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
    setSelectedUser(user);
    setEditForm({ email: user.email, role: user.role, isEnabled: user.isEnabled });
    setShowEditModal(true);
  };

  const thStyle = {
    ...FONT, fontSize: 11, color: G.textMuted, textTransform: 'uppercase',
    letterSpacing: '0.08em', padding: '12px 20px', textAlign: 'left',
    borderBottom: `1px solid ${G.border}`,
  };
  const tdStyle = {
    padding: '14px 20px', borderBottom: `1px solid rgba(201,168,76,0.07)`,
    ...FONT, fontSize: 13, color: G.textPrimary,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${G.goldDim}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ ...FONT, color: G.textMuted, marginTop: 16, fontSize: 13 }}>Loading users...</p>
      </div>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary }}>User Management</h1>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginTop: 4 }}>Manage system users and their roles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'rgba(34,120,80,0.12)', border: '1px solid rgba(34,120,80,0.3)', color: '#6ee7b7' }}>
          <span style={{ ...FONT, fontSize: 13 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7' }}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.25)', color: '#f87171' }}>
          <span style={{ ...FONT, fontSize: 13 }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <JKCard style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <JKInput icon={Search} type="text" placeholder="Search by email or name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <JKSelect icon={Filter} value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            <option value="ALL" style={{ background: '#1C1609' }}>All Roles</option>
            <option value={USER_ROLES.ADMIN} style={{ background: '#1C1609' }}>Admin</option>
            <option value={USER_ROLES.CLIENT} style={{ background: '#1C1609' }}>Client</option>
          </JKSelect>
          <JKSelect icon={Shield} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL" style={{ background: '#1C1609' }}>All Status</option>
            <option value="ACTIVE" style={{ background: '#1C1609' }}>Active</option>
            <option value="DISABLED" style={{ background: '#1C1609' }}>Disabled</option>
          </JKSelect>
        </div>
        <p style={{ ...FONT, fontSize: 12, color: G.textMuted, marginTop: 12 }}>
          Showing {filteredUsers.length} of {users.length} users
        </p>
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
                <tr>
                  <td colSpan="6" style={{ ...FONT, textAlign: 'center', padding: '48px 0', fontSize: 13, color: G.textMuted }}>No users found</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr
                  key={user.id}
                  onMouseEnter={e => e.currentTarget.style.background = G.goldDimmer}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(139,105,20,0.25))', border: `1px solid ${G.goldDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User className="w-4 h-4" style={{ color: G.gold }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: G.textPrimary }}>
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
                        </div>
                        <div style={{ fontSize: 11, color: G.textMuted }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: user.role === USER_ROLES.ADMIN ? 'rgba(180,60,40,0.12)' : G.goldDimmer,
                      color: user.role === USER_ROLES.ADMIN ? '#f87171' : G.gold,
                      border: `1px solid ${user.role === USER_ROLES.ADMIN ? 'rgba(180,60,40,0.2)' : G.goldDim}`,
                    }}>
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
                      : <span style={{ color: G.gold, fontSize: 12 }}>⚠ Unverified</span>
                    }
                  </td>
                  <td style={tdStyle}>
                    {user.profileCompleted
                      ? <span style={{ color: '#6ee7b7', fontSize: 12 }}>✓ Completed</span>
                      : <span style={{ color: G.gold, fontSize: 12 }}>⚠ Incomplete</span>
                    }
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => openEditModal(user)} title="Edit"
                        style={{ background: G.goldDimmer, border: `1px solid ${G.border}`, borderRadius: 8, padding: 6, cursor: 'pointer', color: G.gold }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} title="Disable"
                        style={{ background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#f87171' }}>
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
              <label style={{ ...FONT, color: G.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email Address</label>
              <JKInput icon={Mail} type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="user@example.com" required disabled={creatingUser} />
            </div>
            <div>
              <label style={{ ...FONT, color: G.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Role</label>
              <JKSelect value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} disabled={creatingUser}>
                <option value={USER_ROLES.CLIENT} style={{ background: '#1C1609' }}>Client</option>
                <option value={USER_ROLES.ADMIN} style={{ background: '#1C1609' }}>Admin</option>
              </JKSelect>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: G.goldDimmer, border: `1px solid ${G.border}`, fontSize: 12, color: G.textMuted, ...FONT }}>
              ℹ️ A random password will be generated and sent to the user's email.
            </div>
            {creatingUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(201,168,76,0.08)', border: `1px solid ${G.goldDim}` }}>
                <Loader className="w-4 h-4 animate-spin" style={{ color: G.gold }} />
                <p style={{ ...FONT, fontSize: 12, color: G.textMuted }}>Creating user and sending credentials...</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowCreateModal(false)} disabled={creatingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${G.goldDim}`, color: G.textMuted, ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: creatingUser ? 0.5 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={creatingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: creatingUser ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
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
              <label style={{ ...FONT, color: G.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={editForm.email} disabled
                style={{ background: 'rgba(20,16,8,0.4)', border: `1px solid rgba(201,168,76,0.1)`, color: G.textMuted, borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%', ...FONT, outline: 'none' }} />
            </div>
            <div>
              <label style={{ ...FONT, color: G.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Role</label>
              <JKSelect value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} disabled={editingUser}>
                <option value={USER_ROLES.CLIENT} style={{ background: '#1C1609' }}>Client</option>
                <option value={USER_ROLES.ADMIN} style={{ background: '#1C1609' }}>Admin</option>
              </JKSelect>
            </div>
            <div>
              <label style={{ ...FONT, color: G.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Account Status</label>
              <div style={{ display: 'flex', gap: 20 }}>
                {[{ val: true, l: 'Active' }, { val: false, l: 'Disabled' }].map(opt => (
                  <label key={opt.l} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" checked={editForm.isEnabled === opt.val} onChange={() => setEditForm({ ...editForm, isEnabled: opt.val })} disabled={editingUser} style={{ width: 16, height: 16, accentColor: G.gold }} />
                    <span style={{ ...FONT, fontSize: 13, color: G.textPrimary }}>{opt.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowEditModal(false)} disabled={editingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${G.goldDim}`, color: G.textMuted, ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: editingUser ? 0.5 : 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={editingUser}
                style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: editingUser ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
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
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 className="w-7 h-7" style={{ color: '#f87171' }} />
            </div>
            <p style={{ ...FONT, fontSize: 14, color: G.textPrimary }}>Are you sure you want to disable <strong style={{ color: G.gold }}>{selectedUser.email}</strong>?</p>
            <p style={{ ...FONT, fontSize: 12, color: G.textMuted, marginTop: 6 }}>The user will not be able to log in until reactivated.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowDeleteModal(false)} disabled={deletingUser}
              style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${G.goldDim}`, color: G.textMuted, ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deletingUser ? 0.5 : 1 }}>
              Cancel
            </button>
            <button onClick={handleDisableUser} disabled={deletingUser}
              style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(180,60,40,0.2)', border: '1px solid rgba(180,60,40,0.3)', color: '#f87171', ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deletingUser ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {deletingUser ? <><Loader className="w-4 h-4 animate-spin" />Disabling...</> : 'Disable User'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default AdminUserManagement;