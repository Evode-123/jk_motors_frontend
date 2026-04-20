import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Package, ImageIcon, X, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import apiService from '../../services/apiService';
import { STATIC_BASE_URL } from '../../utils/constants';

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

const JKInput = ({ ...props }) => (
  <input {...props} style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)', color: '#e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%', fontFamily: "'Space Grotesk', sans-serif", outline: 'none' }} />
);

const JKTextarea = ({ rows = 3, ...props }) => (
  <textarea rows={rows} {...props} style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)', color: '#e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 14, width: '100%', fontFamily: "'Space Grotesk', sans-serif", outline: 'none', resize: 'none' }} />
);

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
    <div style={{ background: 'linear-gradient(160deg,#0F2644,#1E3D6E)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(14,165,233,0.15)' }}>
        <h3 style={{ ...T.heading, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#94a3b8' }}><X className="w-4 h-4" /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
    </div>
  </div>
);

const FormActions = ({ onClose, loading, label }) => (
  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
    <button type="button" onClick={onClose} disabled={loading}
      style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(14,165,233,0.2)', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
      Cancel
    </button>
    <button type="submit" disabled={loading}
      style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminCatalogManagement() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [expanded, setExpanded] = useState(null);

  const [serviceModal, setServiceModal] = useState(null);
  const [productModal, setProductModal] = useState(null);
  const [deleteModal,  setDeleteModal]  = useState(null);

  const load = async () => {
    setLoading(true);
    try { const data = await apiService.adminGetServices(); setServices(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ ...T.heading, fontSize: 22, fontWeight: 900 }}>Service Catalog</h1>
          <p style={{ ...T.muted, fontSize: 13, marginTop: 4 }}>Manage services and their products</p>
        </div>
        <button onClick={() => setServiceModal('create')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {success && (
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
          <span style={{ ...T.body, fontSize: 13 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7' }}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', ...T.body, fontSize: 13 }}>{error}</div>}

      {/* Services list */}
      <div className="space-y-4">
        {services.length === 0 && (
          <JKCard style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#1e3d6e' }} />
            <p style={{ ...T.muted, fontSize: 13 }}>No services yet. Create your first service.</p>
          </JKCard>
        )}

        {services.map(svc => (
          <JKCard key={svc.id}>
            {/* Service header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: expanded === svc.id ? '1px solid rgba(14,165,233,0.1)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {svc.imageUrl ? (
                  <img src={`${STATIC_BASE_URL}${svc.imageUrl}`} alt={svc.name}
                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(14,165,233,0.2)' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔧</div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ ...T.body, fontSize: 15, fontWeight: 600 }}>{svc.name}</h3>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: svc.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: svc.isActive ? '#6ee7b7' : '#64748b', border: `1px solid ${svc.isActive ? 'rgba(16,185,129,0.25)' : 'rgba(100,116,139,0.2)'}` }}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ ...T.muted, fontSize: 12, marginTop: 2 }}>{svc.description || 'No description'}</p>
                  <p style={{ color: '#38bdf8', fontSize: 11, marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{svc.products?.length ?? 0} products</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setServiceModal(svc)} title="Edit"
                  style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#38bdf8' }}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteModal({ type: 'service', item: svc })} title="Delete"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#f87171' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}
                  style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#64748b' }}>
                  {expanded === svc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Products panel */}
            {expanded === svc.id && (
              <div style={{ padding: 20, background: 'rgba(14,165,233,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h4 style={{ ...T.label }}>Products</h4>
                  <button onClick={() => setProductModal({ serviceId: svc.id, product: null })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', border: 'none', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>

                {!svc.products?.length ? (
                  <p style={{ ...T.muted, fontSize: 12, textAlign: 'center', padding: '24px 0' }}>No products yet. Add the first one.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {svc.products.map(prd => (
                      <div key={prd.id} style={{ background: 'rgba(30,61,110,0.5)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 12, overflow: 'hidden' }}>
                        {prd.imageUrl ? (
                          <img src={`${STATIC_BASE_URL}${prd.imageUrl}`} alt={prd.name} style={{ width: '100%', height: 112, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: 80, background: 'rgba(14,165,233,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon className="w-6 h-6" style={{ color: '#1e3d6e' }} />
                          </div>
                        )}
                        <div style={{ padding: 12 }}>
                          <p style={{ ...T.body, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{prd.name}</p>
                          <p style={{ ...T.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 10 }}>{prd.description || '—'}</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setProductModal({ serviceId: svc.id, product: prd })}
                              style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Edit
                            </button>
                            <button onClick={() => setDeleteModal({ type: 'product', item: prd })}
                              style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </JKCard>
        ))}
      </div>

      {serviceModal !== null && (
        <ServiceFormModal
          service={serviceModal === 'create' ? null : serviceModal}
          onClose={() => setServiceModal(null)}
          onSaved={() => { load(); flash(serviceModal === 'create' ? 'Service created!' : 'Service updated!'); setServiceModal(null); }}
        />
      )}
      {productModal !== null && (
        <ProductFormModal
          serviceId={productModal.serviceId}
          product={productModal.product}
          onClose={() => setProductModal(null)}
          onSaved={() => { load(); flash(productModal.product ? 'Product updated!' : 'Product added!'); setProductModal(null); }}
        />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          item={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDeleted={() => { load(); flash(`${deleteModal.type === 'service' ? 'Service' : 'Product'} deleted.`); setDeleteModal(null); }}
        />
      )}
    </div>
  );
}

function ServiceFormModal({ service, onClose, onSaved }) {
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(service?.imageUrl ? `${STATIC_BASE_URL}${service.imageUrl}` : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim()); fd.append('description', description); fd.append('isActive', isActive);
      if (imageFile) fd.append('image', imageFile);
      service ? await apiService.adminUpdateService(service.id, fd) : await apiService.adminCreateService(fd);
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={service ? 'Edit Service' : 'Create Service'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={T.label}>Service Image</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 144, borderRadius: 12, border: '2px dashed rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: preview ? 'none' : 'rgba(14,165,233,0.02)' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
              <div style={{ textAlign: 'center' }}>
                <ImageIcon className="w-8 h-8 mx-auto mb-1" style={{ color: '#1e3d6e' }} />
                <p style={{ ...T.muted, fontSize: 12 }}>Click to upload image</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <div><label style={T.label}>Name *</label><JKInput value={name} onChange={e => setName(e.target.value)} required placeholder="Oil Change, Tyre Rotation..." /></div>
        <div><label style={T.label}>Description</label><JKTextarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe this service..." /></div>
        {service && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ ...T.body, fontSize: 13 }}>Active (visible to customers)</span>
          </label>
        )}
        {error && <p style={{ color: '#f87171', fontSize: 12 }}>{error}</p>}
        <FormActions onClose={onClose} loading={loading} label={service ? 'Save Changes' : 'Create Service'} />
      </form>
    </ModalShell>
  );
}

function ProductFormModal({ serviceId, product, onClose, onSaved }) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.imageUrl ? `${STATIC_BASE_URL}${product.imageUrl}` : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim()); fd.append('description', description);
      if (imageFile) fd.append('image', imageFile);
      product ? await apiService.adminUpdateProduct(product.id, fd) : await apiService.adminCreateProduct(serviceId, fd);
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={product ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={T.label}>Product Image</label>
          <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 128, borderRadius: 12, border: '2px dashed rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: 'rgba(14,165,233,0.02)' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
              <div style={{ textAlign: 'center' }}>
                <ImageIcon className="w-7 h-7 mx-auto mb-1" style={{ color: '#1e3d6e' }} />
                <p style={{ ...T.muted, fontSize: 12 }}>Click to upload</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <div><label style={T.label}>Name *</label><JKInput value={name} onChange={e => setName(e.target.value)} required placeholder="Castrol Edge 5W-30..." /></div>
        <div><label style={T.label}>Description</label><JKTextarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe this product..." /></div>
        {error && <p style={{ color: '#f87171', fontSize: 12 }}>{error}</p>}
        <FormActions onClose={onClose} loading={loading} label={product ? 'Save Changes' : 'Add Product'} />
      </form>
    </ModalShell>
  );
}

function DeleteConfirmModal({ item, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      item.type === 'service' ? await apiService.adminDeleteService(item.item.id) : await apiService.adminDeleteProduct(item.item.id);
      onDeleted();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={`Delete ${item.type === 'service' ? 'Service' : 'Product'}`} onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trash2 className="w-6 h-6" style={{ color: '#f87171' }} />
        </div>
        <p style={{ ...T.body, fontSize: 14 }}>
          Delete <strong>"{item.item.name}"</strong>?
          {item.type === 'service' && ' All products will also be deleted.'}
          {' '}This cannot be undone.
        </p>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginTop: 8 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onClose} disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(14,165,233,0.2)', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
          Cancel
        </button>
        <button onClick={handleDelete} disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          Delete
        </button>
      </div>
    </ModalShell>
  );
}