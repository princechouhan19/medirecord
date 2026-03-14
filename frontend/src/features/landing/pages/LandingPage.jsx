import { Link } from 'react-router-dom'
import './LandingPage.scss'

const FEATURES = [
  { icon:'📡', title:'Live Queue Management',     desc:'Real-time patient queue with role-based access. Lab handlers see their assignments, receptionists see the full flow.' },
  { icon:'💳', title:'Smart Billing & Receipts',  desc:'Auto-fill test fees, apply discounts, generate printable receipts and PDFs with your clinic logo.' },
  { icon:'📋', title:'Digital PNDT Register',     desc:'12-column Form F register matching government format. Filter by month, print court-ready reports instantly.' },
  { icon:'🔬', title:'F-Form with ICD-10 AI',     desc:'Structured clinical findings form with AI-assisted ICD-10 code suggestions. Export as PDF.' },
  { icon:'👥', title:'4-Tier Role System',        desc:'Super Admin → Clinic Owner → Receptionist → Lab Handler. Each role sees exactly what they need.' },
  { icon:'📊', title:'Staff Activity Audit',      desc:'Every action logged. Clinic owner sees who registered which patient, when, with full chart analytics.' },
]

const PLANS = [
  {
    name: 'Free', price: '₹0', period: '/forever',
    color: '#64748B',
    features: ['Up to 100 patients/month', '2 staff accounts', 'Basic queue & billing', 'F-Form (5/month)', 'Email support'],
    cta: 'Get Started Free', href: '/login',
  },
  {
    name: 'Pro', price: '₹999', period: '/month',
    color: '#0EA5A0', popular: true,
    features: ['Unlimited patients', '10 staff accounts', 'Full queue + live tracking', 'Unlimited F-Forms + PDF export', 'PNDT register', 'Priority support', 'Billing with discounts', 'Staff activity audit'],
    cta: 'Contact Admin', href: 'mailto:admin@medirecord.in',
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    color: '#8B5CF6',
    features: ['Everything in Pro', 'Unlimited staff', 'Multi-clinic support', 'Custom integrations', 'Dedicated support & SLA', 'Training & onboarding'],
    cta: 'Contact Us', href: 'mailto:sales@medirecord.in',
  },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing__nav">
        <div className="landing__nav-inner">
          <img src="/logo.png" alt="MediRecord" className="landing__nav-logo" />
          <div className="landing__nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:support@medirecord.in">Contact</a>
          </div>
          <Link to="/login" className="lnd-btn lnd-btn--primary">Sign In</Link>
        </div>
      </nav>

      <section className="landing__hero">
        <div className="landing__hero-text">
          <div className="landing__hero-badge">🇮🇳 Built for Indian Clinics</div>
          <h1>Smart EMR for<br/><span>Modern Clinics</span></h1>
          <p>Complete patient management — live queue, PNDT register, F-Forms, billing, and staff audit. Built specifically for Indian diagnostic clinics.</p>
          <div className="landing__hero-actions">
            <a href="mailto:admin@medirecord.in" className="lnd-btn lnd-btn--primary lnd-btn--lg">Request Access →</a>
            <Link to="/login" className="lnd-btn lnd-btn--outline lnd-btn--lg">Sign In</Link>
          </div>
          <div className="landing__hero-stats">
            {[['4','Role Levels'],['PNDT','Form F Ready'],['PDF','F-Form Export'],['Live','Queue Board']].map(([v,l]) => (
              <div key={l} className="landing__stat">
                <span className="landing__stat-val">{v}</span>
                <span className="landing__stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="landing__hero-img-area">
          <div className="landing__hero-mockup">
            <div className="landing__hero-mockup-bar">
              <span/><span/><span/>
            </div>
            <div className="landing__hero-mockup-body">
              <div className="landing__hero-mockup-label">📸 Add app screenshot here</div>
              <div className="landing__hero-mockup-sub">Replace this placeholder with your dashboard screenshot</div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section" id="features">
        <div className="landing__section-inner">
          <div className="landing__pill">Features</div>
          <h2>Everything your clinic needs</h2>
          <p className="landing__section-sub">From patient registration to government compliance — all in one place.</p>

          <div className="landing__img-gallery">
            {['Queue & Workflow','Dashboard','Billing & PNDT'].map(label => (
              <div key={label} className="landing__img-placeholder">
                <div className="landing__img-placeholder-icon">📷</div>
                <div className="landing__img-placeholder-label">{label}</div>
                <div className="landing__img-placeholder-sub">Add screenshot</div>
              </div>
            ))}
          </div>

          <div className="landing__features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="landing__feature-card">
                <div className="landing__feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--gray" id="pricing">
        <div className="landing__section-inner">
          <div className="landing__pill">Pricing</div>
          <h2>Simple, transparent pricing</h2>
          <p className="landing__section-sub">No hidden fees. Start free, upgrade when you grow.</p>
          <div className="landing__plans">
            {PLANS.map(p => (
              <div key={p.name} className={`landing__plan${p.popular ? ' landing__plan--popular' : ''}`} style={{'--pc': p.color}}>
                {p.popular && <div className="landing__plan-badge">Most Popular</div>}
                <div className="landing__plan-name" style={{color: p.color}}>{p.name}</div>
                <div className="landing__plan-price">{p.price}<span className="landing__plan-period">{p.period}</span></div>
                <ul className="landing__plan-list">
                  {p.features.map(f => <li key={f}><span className="landing__check">✓</span>{f}</li>)}
                </ul>
                <a href={p.href} className={`lnd-btn lnd-btn--lg ${p.popular ? 'lnd-btn--primary' : 'lnd-btn--outline'}`} style={{width:'100%',justifyContent:'center',display:'flex'}}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing__cta-section">
        <div className="landing__cta-inner">
          <h2>Ready to modernize your clinic?</h2>
          <p>Join clinics across India using MediRecord for seamless patient management and PNDT compliance.</p>
          <div className="landing__cta-btns">
            <a href="mailto:admin@medirecord.in" className="lnd-btn lnd-btn--primary lnd-btn--lg">Get Started</a>
            <a href="mailto:support@medirecord.in" className="lnd-btn lnd-btn--ghost lnd-btn--lg">Contact Support</a>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <img src="/logo.png" alt="MediRecord" style={{height:28,objectFit:'contain',filter:'brightness(0) invert(1)'}} />
        <div className="landing__footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Login</Link>
          <a href="mailto:support@medirecord.in">Support</a>
        </div>
        <div className="landing__footer-copy">© {new Date().getFullYear()} MediRecord · Built for Indian Clinics</div>
      </footer>
    </div>
  )
}
