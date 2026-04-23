import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { CheckCircle, ChevronRight, ChevronLeft, Car, MapPin, User, Wrench, Loader } from 'lucide-react';
import { SERVICE_TYPE, FUEL_TYPE, STATIC_BASE_URL } from '../../utils/constants';

const G = {
  gold:        '#C9A84C',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.09)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
  surface:     'rgba(28,22,9,0.6)',
};

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };
const STEPS = ['Service', 'Personal Info', 'Car Details', 'Location', 'Review'];

export default function OrderForm() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();

  const [step,       setStep]      = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]     = useState('');
  const [success,    setSuccess]   = useState(false);
  const [services,   setServices]  = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [searchSvc,  setSearchSvc] = useState('');

  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    addressLine: '', city: '', district: '',
    carMake: '', carModel: '', carYear: new Date().getFullYear(),
    carColor: '', carPlate: '', fuelType: '',
    serviceType: SERVICE_TYPE.SERVICE_ONLY,
    notes: '', preferredDate: '',
  });

  useEffect(() => {
    if (user?.profileCompleted) {
      setForm(f => ({ ...f, firstName: user.firstName||'', lastName: user.lastName||'', phone: user.phone||'' }));
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getServices();
        setServices(data);
        const sid = params.get('serviceId');
        const pid = params.get('productId');
        if (sid) {
          const svc = data.find(s => s.id === sid);
          if (svc) {
            setSelectedService(svc);
            if (pid) { const prd = svc.products?.find(p => p.id === pid); if (prd) setSelectedProduct(prd); }
            setStep(1);
          }
        }
      } catch { setError('Failed to load services.'); }
      finally { setLoadingSvc(false); }
    })();
  }, [params]);

  const f = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await apiService.placeOrder({ serviceId: selectedService?.id, productId: selectedProduct?.id, ...form, carYear: Number(form.carYear) });
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return form.firstName && form.lastName;
    if (step === 2) return form.carMake && form.carModel && form.carYear;
    if (step === 3) return form.addressLine && form.city;
    return true;
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchSvc.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchSvc.toLowerCase())
  );

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px', textAlign: 'center' }}>
        <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,120,80,0.15)', border: '2px solid rgba(34,120,80,0.4)', marginBottom: 24 }}>
          <CheckCircle className="w-10 h-10" style={{ color: '#6ee7b7' }} />
        </div>
        <h2 style={{ ...SERIF, fontSize: 24, fontWeight: 700, color: G.textPrimary, marginBottom: 12 }}>Order Placed!</h2>
        <p style={{ ...FONT, color: G.textMuted, marginBottom: 6 }}>Your service request has been submitted.</p>
        <p style={{ ...FONT, color: G.textMuted, fontSize: 13, maxWidth: 380, marginBottom: 32 }}>
          Our team will review your request and set a price. You'll receive an email notification — check your inbox.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/my-orders')} style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            View My Orders
          </button>
          <button onClick={() => navigate('/services')} style={{ padding: '10px 24px', borderRadius: 12, background: 'transparent', border: `1px solid ${G.goldDim}`, color: G.gold, ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Browse More Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary }}>Book a Service</h1>
        <p style={{ ...FONT, color: G.textMuted, fontSize: 13, marginTop: 4 }}>We'll come to you — no need to bring your car.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 4 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: i < step ? '#6ee7b7' : i === step ? 'linear-gradient(135deg,#8B6914,#C9A84C)' : G.goldDimmer,
                color: i < step ? '#0A0804' : i === step ? '#1C1609' : G.textMuted,
                border: i < step ? 'none' : i === step ? 'none' : `1px solid ${G.border}`,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ ...FONT, fontSize: 10, marginTop: 4, textAlign: 'center', lineHeight: 1.2, color: i === step ? G.gold : G.textMuted, fontWeight: i === step ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60 }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, flex: 1, marginBottom: 20, background: i < step ? '#6ee7b7' : G.border }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.25)', color: '#f87171', ...FONT, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Step panel */}
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 20, padding: 24 }}>
        {step === 0 && <StepService services={filteredServices} loading={loadingSvc} search={searchSvc} onSearch={setSearchSvc} selectedService={selectedService} selectedProduct={selectedProduct} onSelectService={setSelectedService} onSelectProduct={setSelectedProduct} />}
        {step === 1 && <StepPersonal form={form} onChange={f} prefilled={user?.profileCompleted} />}
        {step === 2 && <StepCar      form={form} onChange={f} />}
        {step === 3 && <StepAddress  form={form} onChange={f} />}
        {step === 4 && <StepReview   form={form} service={selectedService} product={selectedProduct} />}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'transparent', border: `1px solid ${G.goldDim}`, color: step === 0 ? G.border : G.textMuted, ...FONT, fontSize: 13, fontWeight: 600, cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: canNext() ? 'linear-gradient(135deg,#8B6914,#C9A84C)' : G.goldDimmer, border: canNext() ? 'none' : `1px solid ${G.border}`, color: canNext() ? '#1C1609' : G.textMuted, ...FONT, fontSize: 13, fontWeight: 600, cursor: canNext() ? 'pointer' : 'not-allowed', opacity: canNext() ? 1 : 0.5 }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', ...FONT, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 4px 16px rgba(201,168,76,0.25)' }}>
            {submitting ? <><div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(28,22,9,0.3)',borderTopColor:'#1C1609',animation:'jk-spin 0.7s linear infinite'}} /> Submitting...</> : '✓ Submit Order'}
          </button>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 16px', borderRadius:10, fontSize:13, background:'rgba(20,16,8,0.8)', border:'1px solid rgba(201,168,76,0.2)', color:'#F5E4B8', fontFamily:"'DM Sans',sans-serif", outline:'none' }} />
    </div>
  );
}

function StepService({ services, loading, search, onSearch, selectedService, selectedProduct, onSelectService, onSelectProduct }) {
  const [expanded, setExpanded] = useState(null);
  const G2 = { gold:'#C9A84C', goldDim:'rgba(201,168,76,0.18)', goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8', textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.16)' };

  if (loading) return (
    <div style={{ textAlign:'center', padding:'48px 0' }}>
      <div style={{ width:32,height:32,borderRadius:'50%',border:`2px solid ${G2.goldDimmer}`,borderTopColor:G2.gold,animation:'jk-spin 0.8s linear infinite',margin:'0 auto 12px' }} />
      <p style={{ fontFamily:"'DM Sans',sans-serif", color:G2.textMuted, fontSize:13 }}>Loading services...</p>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontFamily:"'Playfair Display',serif", color:G2.textPrimary, fontSize:16, fontWeight:700, marginBottom:4 }}>Choose a Service</h3>
      <p style={{ fontFamily:"'DM Sans',sans-serif", color:G2.textMuted, fontSize:13, marginBottom:20 }}>Search and select what you need.</p>
      <input type="text" placeholder="Search services..." value={search} onChange={e => onSearch(e.target.value)}
        style={{ width:'100%', padding:'10px 16px', borderRadius:10, fontSize:13, background:'rgba(20,16,8,0.8)', border:`1px solid ${G2.goldDim}`, color:G2.textPrimary, fontFamily:"'DM Sans',sans-serif", outline:'none', marginBottom:16 }} />

      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:320, overflowY:'auto', paddingRight:4 }}>
        {services.map(svc => {
          const isSelected = selectedService?.id === svc.id;
          const isOpen     = expanded === svc.id;
          return (
            <div key={svc.id} style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${isSelected?G2.gold:G2.border}`, transition:'border-color 0.2s' }}>
              <button onClick={() => { onSelectService(svc); onSelectProduct(null); setExpanded(isOpen?null:svc.id); }}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:isSelected?'rgba(201,168,76,0.1)':G2.goldDimmer, border:'none', cursor:'pointer', textAlign:'left' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {svc.imageUrl ? <img src={`${STATIC_BASE_URL}${svc.imageUrl}`} alt="" style={{ width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0 }} /> : <div style={{ width:40,height:40,borderRadius:8,background:'rgba(201,168,76,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>🔧</div>}
                  <div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, color:G2.textPrimary, fontSize:13 }}>{svc.name}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", color:G2.textMuted, fontSize:11 }}>{svc.products?.length??0} products</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {isSelected && <span style={{ fontFamily:"'DM Sans',sans-serif", color:'#6ee7b7', fontSize:11, fontWeight:600 }}>Selected</span>}
                  <ChevronRight className="w-4 h-4" style={{ color:G2.textMuted, transform:isOpen?'rotate(90deg)':'none', transition:'transform 0.2s' }} />
                </div>
              </button>
              {isOpen && svc.products?.length > 0 && (
                <div style={{ padding:'10px 16px 14px', borderTop:`1px solid ${G2.border}`, background:'rgba(20,16,8,0.4)' }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", color:G2.textMuted, fontSize:11, marginBottom:8 }}>Select a product (optional):</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {svc.products.map(prd => (
                      <button key={prd.id} onClick={() => onSelectProduct(selectedProduct?.id===prd.id?null:prd)}
                        style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", background:selectedProduct?.id===prd.id?'rgba(201,168,76,0.2)':'rgba(201,168,76,0.06)', border:`1px solid ${selectedProduct?.id===prd.id?G2.gold:G2.border}`, color:selectedProduct?.id===prd.id?G2.gold:G2.textMuted }}>
                        {prd.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {services.length === 0 && <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.5)', textAlign:'center', padding:'32px 0', fontSize:13 }}>No services found.</p>}
      </div>

      {selectedService && (
        <div style={{ marginTop:16, padding:'10px 14px', borderRadius:10, fontSize:13, background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#C9A84C', fontFamily:"'DM Sans',sans-serif" }}>
          ✓ <strong>{selectedService.name}</strong>{selectedProduct&&<> → {selectedProduct.name}</>}
        </div>
      )}
    </div>
  );
}

function StepPersonal({ form, onChange, prefilled }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:prefilled?4:20 }}>
        <User className="w-5 h-5" style={{ color:'#C9A84C' }} />
        <h3 style={{ fontFamily:"'Playfair Display',serif", color:'#F5E4B8', fontSize:16, fontWeight:700 }}>Personal Information</h3>
      </div>
      {prefilled && <p style={{ fontFamily:"'DM Sans',sans-serif", color:'#6ee7b7', fontSize:11, marginBottom:16 }}>✓ Pre-filled from your profile</p>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Input label="First Name *" value={form.firstName} onChange={v=>onChange('firstName',v)} placeholder="Jean" />
        <Input label="Last Name *"  value={form.lastName}  onChange={v=>onChange('lastName',v)}  placeholder="Uwimana" />
      </div>
      <div style={{ marginTop:16 }}><Input label="Phone Number" value={form.phone} onChange={v=>onChange('phone',v)} placeholder="+250 7XX XXX XXX" type="tel" /></div>
      <div style={{ marginTop:16 }}>
        <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Preferred Service Date (optional)</label>
        <input type="date" value={form.preferredDate} min={new Date().toISOString().split('T')[0]} onChange={e=>onChange('preferredDate',e.target.value)}
          style={{ width:'100%', padding:'10px 16px', borderRadius:10, fontSize:13, background:'rgba(20,16,8,0.8)', border:'1px solid rgba(201,168,76,0.2)', color:'#F5E4B8', fontFamily:"'DM Sans',sans-serif", outline:'none' }} />
      </div>
      <div style={{ marginTop:16 }}>
        <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Notes (optional)</label>
        <textarea value={form.notes} onChange={e=>onChange('notes',e.target.value)} rows={3} placeholder="Describe the issue, any symptoms..."
          style={{ width:'100%', padding:'10px 16px', borderRadius:10, fontSize:13, background:'rgba(20,16,8,0.8)', border:'1px solid rgba(201,168,76,0.2)', color:'#F5E4B8', fontFamily:"'DM Sans',sans-serif", outline:'none', resize:'none' }} />
      </div>
    </div>
  );
}

function StepCar({ form, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);
  const selectStyle = { width:'100%', padding:'10px 16px', borderRadius:10, fontSize:13, appearance:'none', background:'rgba(20,16,8,0.8)', border:'1px solid rgba(201,168,76,0.2)', color:'#F5E4B8', fontFamily:"'DM Sans',sans-serif", outline:'none' };
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
        <Car className="w-5 h-5" style={{ color:'#C9A84C' }} />
        <h3 style={{ fontFamily:"'Playfair Display',serif", color:'#F5E4B8', fontSize:16, fontWeight:700 }}>Car Details</h3>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Input label="Make *"  value={form.carMake}  onChange={v=>onChange('carMake',v)}  placeholder="Toyota" />
        <Input label="Model *" value={form.carModel} onChange={v=>onChange('carModel',v)} placeholder="RAV4" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
        <div>
          <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Year *</label>
          <select value={form.carYear} onChange={e=>onChange('carYear',e.target.value)} style={selectStyle}>
            {years.map(y=><option key={y} value={y} style={{ background:'#1C1609' }}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Fuel Type</label>
          <select value={form.fuelType} onChange={e=>onChange('fuelType',e.target.value)} style={selectStyle}>
            <option value="" style={{ background:'#1C1609' }}>Select fuel</option>
            {Object.entries(FUEL_TYPE).map(([k,v])=><option key={k} value={v} style={{ background:'#1C1609' }}>{k.charAt(0)+k.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
        <Input label="Color"        value={form.carColor} onChange={v=>onChange('carColor',v)} placeholder="White" />
        <Input label="Plate Number" value={form.carPlate} onChange={v=>onChange('carPlate',v)} placeholder="RAC 123A" />
      </div>
      <div style={{ marginTop:16 }}>
        <label style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Service Type</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { value:SERVICE_TYPE.SERVICE_ONLY, label:'Service Only',      desc:'We perform the service' },
            { value:SERVICE_TYPE.WITH_INSTALL, label:'Service + Install', desc:'Service + install parts' },
          ].map(opt=>(
            <button key={opt.value} onClick={()=>onChange('serviceType',opt.value)}
              style={{ padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer', background:form.serviceType===opt.value?'rgba(201,168,76,0.15)':'rgba(20,16,8,0.5)', border:`1px solid ${form.serviceType===opt.value?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.16)'}` }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, color:'#F5E4B8', fontSize:12 }}>{opt.label}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, marginTop:2 }}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepAddress({ form, onChange }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <MapPin className="w-5 h-5" style={{ color:'#C9A84C' }} />
        <h3 style={{ fontFamily:"'Playfair Display',serif", color:'#F5E4B8', fontSize:16, fontWeight:700 }}>Service Location</h3>
      </div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:13, marginBottom:20 }}>Where should we come to service your car?</p>
      <Input label="Address *" value={form.addressLine} onChange={v=>onChange('addressLine',v)} placeholder="KG 123 St, Kacyiru" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
        <Input label="City *"   value={form.city}     onChange={v=>onChange('city',v)}     placeholder="Kigali" />
        <Input label="District" value={form.district} onChange={v=>onChange('district',v)} placeholder="Gasabo" />
      </div>
    </div>
  );
}

function StepReview({ form, service, product }) {
  const rows = [
    ['Service',      service?.name??'—'],
    ['Product',      product?.name??'—'],
    ['Service Type', form.serviceType===SERVICE_TYPE.WITH_INSTALL?'Service + Installation':'Service Only'],
    ['Name',         `${form.firstName} ${form.lastName}`],
    ['Phone',        form.phone||'—'],
    ['Car',          `${form.carMake} ${form.carModel} (${form.carYear})`],
    ['Plate',        form.carPlate||'—'],
    ['Fuel',         form.fuelType||'—'],
    ['Address',      form.addressLine],
    ['City',         `${form.city}${form.district?', '+form.district:''}`],
    ['Date',         form.preferredDate||'Flexible'],
  ];
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <Wrench className="w-5 h-5" style={{ color:'#C9A84C' }} />
        <h3 style={{ fontFamily:"'Playfair Display',serif", color:'#F5E4B8', fontSize:16, fontWeight:700 }}>Review Your Order</h3>
      </div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:13, marginBottom:20 }}>Please review before submitting. No payment required now.</p>
      <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(201,168,76,0.12)' }}>
        {rows.map(([label,val],i)=>(
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 14px', background:i%2===0?'rgba(201,168,76,0.04)':'transparent', borderBottom:i<rows.length-1?'1px solid rgba(201,168,76,0.07)':'none' }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', minWidth:90 }}>{label}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", color:'#F5E4B8', fontSize:13, textAlign:'right', maxWidth:260 }}>{val}</span>
          </div>
        ))}
      </div>
      {form.notes && (
        <div style={{ marginTop:12 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Notes</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", color:'#F5E4B8', fontSize:13 }}>{form.notes}</p>
        </div>
      )}
      <div style={{ marginTop:16, padding:'10px 14px', borderRadius:10, fontSize:13, background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)', color:'#C9A84C', fontFamily:"'DM Sans',sans-serif" }}>
        ℹ️ After submission, our team sets a price and you'll get an email to confirm or reject.
      </div>
    </div>
  );
}