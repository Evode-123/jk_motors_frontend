import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { CheckCircle, ChevronRight, ChevronLeft, Car, MapPin, User, Wrench, Loader } from 'lucide-react';
import { SERVICE_TYPE, FUEL_TYPE, STATIC_BASE_URL } from '../../utils/constants';

const STEPS = ['Service', 'Personal Info', 'Car Details', 'Location', 'Review'];

export default function OrderForm() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();

  const [step,       setStep]      = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]     = useState('');
  const [success,    setSuccess]   = useState(false);

  // Catalog state
  const [services,    setServices]    = useState([]);
  const [loadingSvc,  setLoadingSvc]  = useState(true);
  const [searchSvc,   setSearchSvc]   = useState('');

  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form state
  const [form, setForm] = useState({
    firstName:    '',
    lastName:     '',
    phone:        '',
    addressLine:  '',
    city:         '',
    district:     '',
    carMake:      '',
    carModel:     '',
    carYear:      new Date().getFullYear(),
    carColor:     '',
    carPlate:     '',
    fuelType:     '',
    serviceType:  SERVICE_TYPE.SERVICE_ONLY,
    notes:        '',
    preferredDate: '',
  });

  // Pre-fill personal info if profile is completed
  useEffect(() => {
    if (user?.profileCompleted) {
      setForm(f => ({
        ...f,
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        phone:     user.phone     || '',
      }));
    }
  }, [user]);

  // Load services
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
            if (pid) {
              const prd = svc.products?.find(p => p.id === pid);
              if (prd) setSelectedProduct(prd);
            }
            setStep(1);
          }
        }
      } catch {
        setError('Failed to load services.');
      } finally {
        setLoadingSvc(false);
      }
    })();
  }, [params]);

  const f = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await apiService.placeOrder({
        serviceId: selectedService?.id,
        productId: selectedProduct?.id,
        ...form,
        carYear: Number(form.carYear),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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

  // ── Success state (inside dashboard layout) ──────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'rgba(16,185,129,0.15)',
            border: '2px solid rgba(16,185,129,0.4)',
          }}
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 22, fontWeight: 900,
            color: '#e2e8f0', marginBottom: 12,
          }}
        >
          Order Placed!
        </h2>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', marginBottom: 6 }}>
          Your service request has been submitted.
        </p>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#64748b', fontSize: 13,
            maxWidth: 380, marginBottom: 32,
          }}
        >
          Our team will review your request and set a price. You'll receive an email notification — check your inbox.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate('/my-orders')}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              border: 'none', color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/services')}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: 'transparent',
              border: '1px solid rgba(14,165,233,0.3)',
              color: '#38bdf8',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Browse More Services
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Page title */}
      <div className="mb-6">
        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 20, fontWeight: 900, color: '#e2e8f0',
          }}
        >
          Book a Service
        </h1>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 13, marginTop: 4 }}>
          We'll come to you — no need to bring your car.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8 gap-1">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center" style={{ flex: 1, minWidth: 0 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={
                  i < step  ? { background: '#10b981', color: '#fff' } :
                  i === step ? { background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', color: '#fff' } :
                               { background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)', color: '#64748b' }
                }
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 10, marginTop: 4, textAlign: 'center', lineHeight: 1.2,
                  color: i === step ? '#38bdf8' : '#475569',
                  fontWeight: i === step ? 600 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60,
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-px flex-1 mb-5 transition-colors"
                style={{ background: i < step ? '#10b981' : 'rgba(14,165,233,0.15)' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {/* Step panel */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(30,61,110,0.4)',
          border: '1px solid rgba(14,165,233,0.15)',
        }}
      >
        {step === 0 && (
          <StepService
            services={filteredServices}
            loading={loadingSvc}
            search={searchSvc}
            onSearch={setSearchSvc}
            selectedService={selectedService}
            selectedProduct={selectedProduct}
            onSelectService={setSelectedService}
            onSelectProduct={setSelectedProduct}
          />
        )}
        {step === 1 && <StepPersonal form={form} onChange={f} prefilled={user?.profileCompleted} />}
        {step === 2 && <StepCar      form={form} onChange={f} />}
        {step === 3 && <StepAddress  form={form} onChange={f} />}
        {step === 4 && <StepReview   form={form} service={selectedService} product={selectedProduct} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: 'transparent',
            border: '1px solid rgba(14,165,233,0.2)',
            color: step === 0 ? '#334155' : '#94a3b8',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, fontWeight: 600,
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 12,
              background: canNext()
                ? 'linear-gradient(135deg,#0EA5E9,#6366F1)'
                : 'rgba(14,165,233,0.08)',
              border: canNext() ? 'none' : '1px solid rgba(14,165,233,0.15)',
              color: canNext() ? '#fff' : '#475569',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600,
              cursor: canNext() ? 'pointer' : 'not-allowed',
              opacity: canNext() ? 1 : 0.5,
            }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              border: 'none', color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
            }}
          >
            {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Submitting...</> : '✓ Submit Order'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step sub-components ───────────────────────────────────────────────────────

function StepService({ services, loading, search, onSearch, selectedService, selectedProduct, onSelectService, onSelectProduct }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="py-12 text-center">
      <Loader className="w-8 h-8 animate-spin mx-auto" style={{ color: '#0EA5E9' }} />
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', marginTop: 12, fontSize: 13 }}>
        Loading services...
      </p>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
        Choose a Service
      </h3>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        Search and select what you need.
      </p>

      <input
        type="text"
        placeholder="Search services..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13,
          background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
          color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif",
          outline: 'none', marginBottom: 16,
        }}
      />

      <div className="space-y-3" style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
        {services.map(svc => {
          const isSelected = selectedService?.id === svc.id;
          const isOpen     = expanded === svc.id;
          return (
            <div key={svc.id}
              className="rounded-xl overflow-hidden transition-all"
              style={{ border: `1px solid ${isSelected ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.12)'}` }}>
              <button
                onClick={() => {
                  onSelectService(svc);
                  onSelectProduct(null);
                  setExpanded(isOpen ? null : svc.id);
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '12px 16px',
                  background: isSelected ? 'rgba(14,165,233,0.1)' : 'rgba(14,165,233,0.03)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {svc.imageUrl ? (
                    <img src={`${STATIC_BASE_URL}${svc.imageUrl}`} alt=""
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔧</div>
                  )}
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{svc.name}</p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 11 }}>{svc.products?.length ?? 0} products</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isSelected && <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#6ee7b7', fontSize: 11, fontWeight: 600 }}>Selected</span>}
                  <ChevronRight className="w-4 h-4"
                    style={{ color: '#475569', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </button>

              {isOpen && svc.products?.length > 0 && (
                <div style={{ padding: '10px 16px 14px', borderTop: '1px solid rgba(14,165,233,0.1)' }}>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 11, marginBottom: 8 }}>
                    Select a product (optional):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {svc.products.map(prd => (
                      <button key={prd.id}
                        onClick={() => onSelectProduct(selectedProduct?.id === prd.id ? null : prd)}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                          fontFamily: "'Space Grotesk', sans-serif",
                          background: selectedProduct?.id === prd.id ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.05)',
                          border: `1px solid ${selectedProduct?.id === prd.id ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.15)'}`,
                          color: selectedProduct?.id === prd.id ? '#38bdf8' : '#94a3b8',
                        }}
                      >
                        {prd.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {services.length === 0 && (
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#475569', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>
            No services found.
          </p>
        )}
      </div>

      {selectedService && (
        <div style={{
          marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
          background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)',
          color: '#38bdf8', fontFamily: "'Space Grotesk', sans-serif",
        }}>
          ✓ <strong>{selectedService.name}</strong>
          {selectedProduct && <> → {selectedProduct.name}</>}
        </div>
      )}
    </div>
  );
}

function StepPersonal({ form, onChange, prefilled }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: prefilled ? 4 : 20 }}>
        <User className="w-5 h-5" style={{ color: '#38bdf8' }} />
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0', fontSize: 16, fontWeight: 700 }}>Personal Information</h3>
      </div>
      {prefilled && (
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#6ee7b7', fontSize: 11, marginBottom: 16 }}>
          ✓ Pre-filled from your profile
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name *" value={form.firstName} onChange={v => onChange('firstName', v)} placeholder="Jean" />
        <Input label="Last Name *"  value={form.lastName}  onChange={v => onChange('lastName', v)}  placeholder="Uwimana" />
      </div>
      <div style={{ marginTop: 16 }}>
        <Input label="Phone Number" value={form.phone} onChange={v => onChange('phone', v)} placeholder="+250 7XX XXX XXX" type="tel" />
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
          Preferred Service Date (optional)
        </label>
        <input
          type="date"
          value={form.preferredDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => onChange('preferredDate', e.target.value)}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13,
            background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
            color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", outline: 'none',
          }}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
          Notes (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={e => onChange('notes', e.target.value)}
          rows={3}
          placeholder="Describe the issue, any symptoms, anything we should know..."
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13,
            background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
            color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", outline: 'none', resize: 'none',
          }}
        />
      </div>
    </div>
  );
}

function StepCar({ form, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

  const selectStyle = {
    width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, appearance: 'none',
    background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
    color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Car className="w-5 h-5" style={{ color: '#38bdf8' }} />
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0', fontSize: 16, fontWeight: 700 }}>Car Details</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Make *"  value={form.carMake}  onChange={v => onChange('carMake', v)}  placeholder="Toyota" />
        <Input label="Model *" value={form.carModel} onChange={v => onChange('carModel', v)} placeholder="RAV4" />
      </div>
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: 16 }}>
        <div>
          <label style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Year *</label>
          <select value={form.carYear} onChange={e => onChange('carYear', e.target.value)} style={selectStyle}>
            {years.map(y => <option key={y} value={y} style={{ background: '#1e3a58' }}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Fuel Type</label>
          <select value={form.fuelType} onChange={e => onChange('fuelType', e.target.value)} style={selectStyle}>
            <option value="" style={{ background: '#1e3a58' }}>Select fuel</option>
            {Object.entries(FUEL_TYPE).map(([k, v]) =>
              <option key={k} value={v} style={{ background: '#1e3a58' }}>{k.charAt(0) + k.slice(1).toLowerCase()}</option>
            )}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: 16 }}>
        <Input label="Color"        value={form.carColor} onChange={v => onChange('carColor', v)} placeholder="White" />
        <Input label="Plate Number" value={form.carPlate} onChange={v => onChange('carPlate', v)} placeholder="RAC 123A" />
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Service Type</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: SERVICE_TYPE.SERVICE_ONLY, label: 'Service Only',      desc: 'We perform the service' },
            { value: SERVICE_TYPE.WITH_INSTALL, label: 'Service + Install', desc: 'Service + install parts' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange('serviceType', opt.value)}
              style={{
                padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                background: form.serviceType === opt.value ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.03)',
                border: `1px solid ${form.serviceType === opt.value ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.12)'}`,
              }}
            >
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#e2e8f0', fontSize: 12 }}>{opt.label}</p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 11, marginTop: 2 }}>{opt.desc}</p>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <MapPin className="w-5 h-5" style={{ color: '#38bdf8' }} />
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0', fontSize: 16, fontWeight: 700 }}>Service Location</h3>
      </div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        Where should we come to service your car?
      </p>
      <Input label="Address *" value={form.addressLine} onChange={v => onChange('addressLine', v)} placeholder="KG 123 St, Kacyiru" />
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: 16 }}>
        <Input label="City *"   value={form.city}     onChange={v => onChange('city', v)}     placeholder="Kigali" />
        <Input label="District" value={form.district} onChange={v => onChange('district', v)} placeholder="Gasabo" />
      </div>
    </div>
  );
}

function StepReview({ form, service, product }) {
  const rows = [
    ['Service',      service?.name ?? '—'],
    ['Product',      product?.name ?? '—'],
    ['Service Type', form.serviceType === SERVICE_TYPE.WITH_INSTALL ? 'Service + Installation' : 'Service Only'],
    ['Name',         `${form.firstName} ${form.lastName}`],
    ['Phone',        form.phone || '—'],
    ['Car',          `${form.carMake} ${form.carModel} (${form.carYear})`],
    ['Plate',        form.carPlate || '—'],
    ['Fuel',         form.fuelType || '—'],
    ['Address',      form.addressLine],
    ['City',         `${form.city}${form.district ? ', ' + form.district : ''}`],
    ['Date',         form.preferredDate || 'Flexible'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Wrench className="w-5 h-5" style={{ color: '#38bdf8' }} />
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0', fontSize: 16, fontWeight: 700 }}>Review Your Order</h3>
      </div>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        Please review before submitting. No payment required now.
      </p>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(14,165,233,0.1)' }}>
        {rows.map(([label, val], i) => (
          <div key={label}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 14px',
              background: i % 2 === 0 ? 'rgba(14,165,233,0.03)' : 'transparent',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(14,165,233,0.06)' : 'none',
            }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 90 }}>
              {label}
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0', fontSize: 13, textAlign: 'right', maxWidth: 260 }}>
              {val}
            </span>
          </div>
        ))}
      </div>
      {form.notes && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Notes</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0', fontSize: 13 }}>{form.notes}</p>
        </div>
      )}
      <div style={{
        marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
        background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
        color: '#7dd3fc', fontFamily: "'Space Grotesk', sans-serif",
      }}>
        ℹ️ After submission, our team sets a price and you'll get an email to confirm or reject.
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#94a3b8', fontSize: 11,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'block', marginBottom: 6,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13,
          background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)',
          color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", outline: 'none',
        }}
      />
    </div>
  );
}