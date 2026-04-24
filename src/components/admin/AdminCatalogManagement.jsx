import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Package, ImageIcon, X, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import apiService from '../../services/apiService';
import { getImageUrl } from '../../utils/imageUrl';   // ← UPDATED

const G = { gold:'#C9A84C', goldLight:'#E8C96A', goldDim:'rgba(201,168,76,0.18)', goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8', textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.16)', surface:'rgba(28,22,9,0.6)' };
const FONT  = { fontFamily:"'DM Sans', sans-serif" };
const SERIF = { fontFamily:"'Playfair Display', serif" };

const T = {
  label: { fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 },
  body:  { fontFamily:"'DM Sans',sans-serif", color:'#F5E4B8' },
  muted: { fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)' },
};

const JKCard = ({ children, style={} }) => (
  <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, overflow:'hidden', ...style }}>{children}</div>
);

const JKInput = ({ ...props }) => (
  <input {...props} style={{ background:'rgba(20,16,8,0.8)', border:`1px solid ${G.goldDim}`, color:G.textPrimary, borderRadius:12, padding:'10px 16px', fontSize:14, width:'100%', ...FONT, outline:'none' }} />
);

const JKTextarea = ({ rows=3, ...props }) => (
  <textarea rows={rows} {...props} style={{ background:'rgba(20,16,8,0.8)', border:`1px solid ${G.goldDim}`, color:G.textPrimary, borderRadius:12, padding:'10px 16px', fontSize:14, width:'100%', ...FONT, outline:'none', resize:'none' }} />
);

const ModalShell = ({ title, onClose, children }) => (
  <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(6px)' }}>
    <div style={{ background:'linear-gradient(160deg,#100D05,#1C1609)', border:`1px solid ${G.goldDim}`, borderRadius:20, width:'100%', maxWidth:480, maxHeight:'90vh', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid ${G.border}` }}>
        <h3 style={{ ...SERIF, fontSize:16, fontWeight:700, color:G.textPrimary }}>{title}</h3>
        <button onClick={onClose} style={{ background:G.goldDimmer, border:`1px solid ${G.border}`, borderRadius:8, padding:6, cursor:'pointer', color:G.textMuted }}><X className="w-4 h-4" /></button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>{children}</div>
    </div>
  </div>
);

const FormActions = ({ onClose, loading, label }) => (
  <div style={{ display:'flex', gap:12, marginTop:8 }}>
    <button type="button" onClick={onClose} disabled={loading}
      style={{ flex:1, padding:'10px', borderRadius:12, background:'transparent', border:`1px solid ${G.goldDim}`, color:G.textMuted, ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:loading?0.5:1 }}>
      Cancel
    </button>
    <button type="submit" disabled={loading}
      style={{ flex:1, padding:'10px', borderRadius:12, background:'linear-gradient(135deg,#8B6914,#C9A84C)', border:'none', color:'#1C1609', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:loading?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  </div>
);

export default function AdminCatalogManagement() {
  const [services,setServices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [expanded,setExpanded]=useState(null);
  const [serviceModal,setServiceModal]=useState(null);
  const [productModal,setProductModal]=useState(null);
  const [deleteModal,setDeleteModal]=useState(null);

  const load = async () => {
    setLoading(true);
    try { const data = await apiService.adminGetServices(); setServices(data); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:80 }}>
      <div style={{ width:32,height:32,borderRadius:'50%',border:`2px solid ${G.goldDim}`,borderTopColor:G.gold,animation:'jk-spin 0.8s linear infinite' }} />
      <style>{`@keyframes jk-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`@keyframes jk-spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ ...SERIF, fontSize:22, fontWeight:700, color:G.textPrimary }}>Service Catalog</h1>
          <p style={{ ...T.muted, fontSize:13, marginTop:4 }}>Manage services and their products</p>
        </div>
        <button onClick={() => setServiceModal('create')}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,#8B6914,#C9A84C)', border:'none', color:'#1C1609', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {success && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:12, background:'rgba(34,120,80,0.12)', border:'1px solid rgba(34,120,80,0.3)', color:'#6ee7b7' }}>
          <span style={{ ...FONT, fontSize:13 }}>{success}</span>
          <button onClick={() => setSuccess('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#6ee7b7' }}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(180,60,40,0.1)', border:'1px solid rgba(180,60,40,0.25)', color:'#f87171', ...FONT, fontSize:13 }}>{error}</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {services.length === 0 && (
          <JKCard style={{ textAlign:'center', padding:'64px 24px' }}>
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color:G.goldDim }} />
            <p style={{ ...T.muted, fontSize:13 }}>No services yet. Create your first service.</p>
          </JKCard>
        )}

        {services.map(svc => (
          <JKCard key={svc.id}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px', borderBottom:expanded===svc.id?`1px solid ${G.border}`:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                {/* ← UPDATED: use getImageUrl */}
                {getImageUrl(svc.imageUrl) ? (
                  <img src={getImageUrl(svc.imageUrl)} alt={svc.name} style={{ width:56, height:56, borderRadius:12, objectFit:'cover', border:`1px solid ${G.goldDim}` }} />
                ) : (
                  <div style={{ width:56, height:56, borderRadius:12, background:G.goldDimmer, border:`1px solid ${G.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🔧</div>
                )}
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <h3 style={{ ...FONT, fontSize:15, fontWeight:600, color:G.textPrimary }}>{svc.name}</h3>
                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, background:svc.isActive?'rgba(34,120,80,0.15)':'rgba(80,70,50,0.15)', color:svc.isActive?'#6ee7b7':'rgba(168,136,72,0.6)', border:`1px solid ${svc.isActive?'rgba(34,120,80,0.25)':'rgba(80,70,50,0.2)'}` }}>
                      {svc.isActive?'Active':'Inactive'}
                    </span>
                  </div>
                  <p style={{ ...T.muted, fontSize:12, marginTop:2 }}>{svc.description||'No description'}</p>
                  <p style={{ color:G.gold, fontSize:11, marginTop:4, ...FONT }}>{svc.products?.length??0} products</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={() => setServiceModal(svc)} title="Edit" style={{ background:G.goldDimmer, border:`1px solid ${G.border}`, borderRadius:8, padding:7, cursor:'pointer', color:G.gold }}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteModal({ type:'service', item:svc })} title="Delete" style={{ background:'rgba(180,60,40,0.08)', border:'1px solid rgba(180,60,40,0.15)', borderRadius:8, padding:7, cursor:'pointer', color:'#f87171' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setExpanded(expanded===svc.id?null:svc.id)} style={{ background:G.goldDimmer, border:`1px solid ${G.border}`, borderRadius:8, padding:7, cursor:'pointer', color:G.textMuted }}>
                  {expanded===svc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expanded===svc.id && (
              <div style={{ padding:20, background:G.goldDimmer }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <span style={T.label}>Products</span>
                  <button onClick={() => setProductModal({ serviceId:svc.id, product:null })}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10, background:'linear-gradient(135deg,#8B6914,#C9A84C)', border:'none', color:'#1C1609', ...FONT, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>
                {!svc.products?.length ? (
                  <p style={{ ...T.muted, fontSize:12, textAlign:'center', padding:'24px 0' }}>No products yet. Add the first one.</p>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
                    {svc.products.map(prd => (
                      <div key={prd.id} style={{ background:'rgba(20,16,8,0.7)', border:`1px solid ${G.border}`, borderRadius:12, overflow:'hidden' }}>
                        {/* ← UPDATED: use getImageUrl */}
                        {getImageUrl(prd.imageUrl) ? (
                          <img src={getImageUrl(prd.imageUrl)} alt={prd.name} style={{ width:'100%', height:112, objectFit:'cover' }} />
                        ) : (
                          <div style={{ width:'100%', height:80, background:G.goldDimmer, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <ImageIcon className="w-6 h-6" style={{ color:G.goldDim }} />
                          </div>
                        )}
                        <div style={{ padding:12 }}>
                          <p style={{ ...FONT, fontSize:13, fontWeight:600, color:G.textPrimary, marginBottom:4 }}>{prd.name}</p>
                          <p style={{ ...T.muted, fontSize:11, lineHeight:1.5, marginBottom:10 }}>{prd.description||'—'}</p>
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={() => setProductModal({ serviceId:svc.id, product:prd })}
                              style={{ flex:1, padding:'6px', borderRadius:8, background:G.goldDimmer, border:`1px solid ${G.border}`, color:G.gold, ...FONT, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                              Edit
                            </button>
                            <button onClick={() => setDeleteModal({ type:'product', item:prd })}
                              style={{ flex:1, padding:'6px', borderRadius:8, background:'rgba(180,60,40,0.08)', border:'1px solid rgba(180,60,40,0.15)', color:'#f87171', ...FONT, fontSize:12, fontWeight:600, cursor:'pointer' }}>
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
        <ServiceFormModal service={serviceModal==='create'?null:serviceModal} onClose={() => setServiceModal(null)} onSaved={() => { load(); flash(serviceModal==='create'?'Service created!':'Service updated!'); setServiceModal(null); }} />
      )}
      {productModal !== null && (
        <ProductFormModal serviceId={productModal.serviceId} product={productModal.product} onClose={() => setProductModal(null)} onSaved={() => { load(); flash(productModal.product?'Product updated!':'Product added!'); setProductModal(null); }} />
      )}
      {deleteModal && (
        <DeleteConfirmModal item={deleteModal} onClose={() => setDeleteModal(null)} onDeleted={() => { load(); flash(`${deleteModal.type==='service'?'Service':'Product'} deleted.`); setDeleteModal(null); }} />
      )}
    </div>
  );
}

function ServiceFormModal({ service, onClose, onSaved }) {
  const [name,setName]=useState(service?.name??'');
  const [description,setDescription]=useState(service?.description??'');
  const [isActive,setIsActive]=useState(service?.isActive??true);
  const [imageFile,setImageFile]=useState(null);
  // ← UPDATED: use getImageUrl for existing image preview
  const [preview,setPreview]=useState(getImageUrl(service?.imageUrl) ?? null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const fileRef=useRef();

  const handleFile = (e) => { const f=e.target.files?.[0]; if(!f) return; setImageFile(f); setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true); setError('');
    try {
      const fd=new FormData();
      fd.append('name',name.trim()); fd.append('description',description); fd.append('isActive',isActive);
      if (imageFile) fd.append('image',imageFile);
      service ? await apiService.adminUpdateService(service.id,fd) : await apiService.adminCreateService(fd);
      onSaved();
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={service?'Edit Service':'Create Service'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={T.label}>Service Image</label>
          <div onClick={() => fileRef.current?.click()} style={{ width:'100%', height:144, borderRadius:12, border:`2px dashed rgba(201,168,76,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:preview?'none':G.goldDimmer }}>
            {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (
              <div style={{ textAlign:'center' }}>
                <ImageIcon className="w-8 h-8 mx-auto mb-1" style={{ color:G.goldDim }} />
                <p style={{ ...FONT, fontSize:12, color:G.textMuted }}>Click to upload image</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
        </div>
        <div><label style={T.label}>Name *</label><JKInput value={name} onChange={e=>setName(e.target.value)} required placeholder="Oil Change, Tyre Rotation..." /></div>
        <div><label style={T.label}>Description</label><JKTextarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Describe this service..." /></div>
        {service && (
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} style={{ width:16, height:16 }} />
            <span style={{ ...FONT, fontSize:13, color:'#F5E4B8' }}>Active (visible to customers)</span>
          </label>
        )}
        {error && <p style={{ color:'#f87171', fontSize:12 }}>{error}</p>}
        <FormActions onClose={onClose} loading={loading} label={service?'Save Changes':'Create Service'} />
      </form>
    </ModalShell>
  );
}

function ProductFormModal({ serviceId, product, onClose, onSaved }) {
  const [name,setName]=useState(product?.name??'');
  const [description,setDescription]=useState(product?.description??'');
  const [imageFile,setImageFile]=useState(null);
  // ← UPDATED: use getImageUrl for existing image preview
  const [preview,setPreview]=useState(getImageUrl(product?.imageUrl) ?? null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const fileRef=useRef();

  const handleFile = (e) => { const f=e.target.files?.[0]; if(!f) return; setImageFile(f); setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true); setError('');
    try {
      const fd=new FormData();
      fd.append('name',name.trim()); fd.append('description',description);
      if (imageFile) fd.append('image',imageFile);
      product ? await apiService.adminUpdateProduct(product.id,fd) : await apiService.adminCreateProduct(serviceId,fd);
      onSaved();
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={product?'Edit Product':'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={T.label}>Product Image</label>
          <div onClick={() => fileRef.current?.click()} style={{ width:'100%', height:128, borderRadius:12, border:`2px dashed rgba(201,168,76,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:G.goldDimmer }}>
            {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (
              <div style={{ textAlign:'center' }}>
                <ImageIcon className="w-7 h-7 mx-auto mb-1" style={{ color:G.goldDim }} />
                <p style={{ ...FONT, fontSize:12, color:G.textMuted }}>Click to upload</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
        </div>
        <div><label style={T.label}>Name *</label><JKInput value={name} onChange={e=>setName(e.target.value)} required placeholder="Castrol Edge 5W-30..." /></div>
        <div><label style={T.label}>Description</label><JKTextarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Describe this product..." /></div>
        {error && <p style={{ color:'#f87171', fontSize:12 }}>{error}</p>}
        <FormActions onClose={onClose} loading={loading} label={product?'Save Changes':'Add Product'} />
      </form>
    </ModalShell>
  );
}

function DeleteConfirmModal({ item, onClose, onDeleted }) {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      item.type==='service' ? await apiService.adminDeleteService(item.item.id) : await apiService.adminDeleteProduct(item.item.id);
      onDeleted();
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={`Delete ${item.type==='service'?'Service':'Product'}`} onClose={onClose}>
      <div style={{ textAlign:'center', padding:'8px 0' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(180,60,40,0.1)', border:'1px solid rgba(180,60,40,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Trash2 className="w-6 h-6" style={{ color:'#f87171' }} />
        </div>
        <p style={{ ...FONT, fontSize:14, color:G.textPrimary }}>
          Delete <strong>"{item.item.name}"</strong>?
          {item.type==='service' && ' All products will also be deleted.'}
          {' '}This cannot be undone.
        </p>
      </div>
      {error && <p style={{ color:'#f87171', fontSize:12, textAlign:'center', marginTop:8 }}>{error}</p>}
      <div style={{ display:'flex', gap:12, marginTop:24 }}>
        <button onClick={onClose} disabled={loading}
          style={{ flex:1, padding:'10px', borderRadius:12, background:'transparent', border:`1px solid ${G.goldDim}`, color:G.textMuted, ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:loading?0.5:1 }}>
          Cancel
        </button>
        <button onClick={handleDelete} disabled={loading}
          style={{ flex:1, padding:'10px', borderRadius:12, background:'rgba(180,60,40,0.2)', border:'1px solid rgba(180,60,40,0.3)', color:'#f87171', ...FONT, fontSize:13, fontWeight:600, cursor:'pointer', opacity:loading?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          Delete
        </button>
      </div>
    </ModalShell>
  );
}