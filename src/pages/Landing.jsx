import React, { useState } from 'react';
import { Calendar as CalendarIcon, Map, Users, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const BentoLanding = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (cardId) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
    }
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      setExpandedCard(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const cards = [
    {
      id: 'calendar',
      label: 'CALENDAR',
      to: '/calendar',
      frontClass: 'agents-front',
      badge: '2024 – Present',
      company: 'Session Management',
      role: 'Booking System',
      meta: 'Studio',
      desc: 'Manage all studio sessions, view daily schedules, and track client bookings with our comprehensive calendar system.',
      tags: ['Scheduling', 'Clients', 'Sessions', 'Rescheduling']
    },
    {
      id: 'studio-map',
      label: 'STUDIO MAP',
      to: '/studio-map',
      frontClass: 'brand-front',
      badge: 'Live Status',
      company: 'Equipment Tracker',
      role: 'Inventory Management',
      meta: 'Real-time',
      desc: 'Monitor all studio equipment availability, track items in repair, and manage your inventory efficiently.',
      tags: ['Equipment', 'Inventory', 'Maintenance', 'Availability']
    },
    {
      id: 'staff',
      label: 'STAFF',
      to: '/staff',
      frontClass: 'design-front',
      badge: 'Team',
      company: 'Staff Hub',
      role: 'Team Management',
      meta: 'Configuration',
      desc: 'Manage staff availability, configure studio policies, set daily capacity, and track follow-ups.',
      tags: ['Settings', 'Capacity', 'Policies', 'Follow-ups']
    },
    {
      id: 'title',
      label: '',
      to: null,
      isTitle: true,
      frontClass: 'uipedia-card'
    },
    {
      id: 'complaints',
      label: 'COMPLAINTS',
      to: '/complaints',
      frontClass: 'editor-front',
      badge: 'Tracking',
      company: 'Issue Resolution',
      role: 'Complaint Management',
      meta: 'Client Care',
      desc: 'Log and track client complaints, monitor resolution status, and maintain service quality records.',
      tags: ['Issues', 'Resolution', 'Client Care', 'Quality']
    },
    {
      id: 'contact',
      label: "LET'S TALK",
      to: null,
      isContact: true,
      frontClass: 'contact-front'
    },
    {
      id: 'subtitle',
      label: '',
      to: null,
      isSubtitle: true,
      frontClass: 'gradient-front'
    },
    {
      id: 'about',
      label: '',
      to: null,
      isBio: true,
      frontClass: 'bio-front',
      bioText: (
        <>
          <p><strong>Studio Management Platform</strong> and <strong>Booking System</strong>.</p>
          <p>Comprehensive solution for session scheduling, equipment tracking, and client management.</p>
          <p className="italic">Calendar, inventory, staff, and complaint management in one place.</p>
        </>
      ),
      skills: [
        { category: 'Features', icons: ['Calendar', 'Map', 'Users', 'Alert'] },
        { category: 'Management', icons: ['Sessions', 'Equipment', 'Staff', 'Reports'] }
      ]
    }
  ];

  return (
    <div className="stage">
      <div className="hero" aria-hidden="false">
        <div className="bento-grid">
          {/* Calendar Card */}
          <div 
            className={`bento-card expand-card ${expandedCard === 'calendar' ? 'is-expanded' : ''}`} 
            data-expand="calendar"
            onClick={() => handleCardClick('calendar')}
          >
            <div className="card-inner">
              <div className="card-front agents-front">
                <span className="expand-hint" aria-hidden="true"></span>
                <div className="tab-label">CALENDAR</div>
              </div>
              <div className="card-back">
                <button className="expand-close" aria-label="Flip back" onClick={(e) => { e.stopPropagation(); handleCardClick('calendar'); }}>←</button>
                <div className="back-content split-layout wide-content">
                  <div className="split-col">
                    <span className="back-badge agents-accent">2024 – Present</span>
                    <h3 className="back-company">Session Management</h3>
                    <p className="back-role">Booking System</p>
                    <span className="back-meta">Studio</span>
                    <div className="back-divider"></div>
                    <p className="back-desc" style={{marginTop: 'auto'}}>
                      Manage all studio sessions, view daily schedules, and track client bookings with our comprehensive calendar system.
                    </p>
                  </div>
                  <div className="split-col">
                    <h3 className="back-company">Features</h3>
                    <p className="back-role">Complete Scheduling</p>
                    <div className="back-divider"></div>
                    <div className="back-tags">
                      <span className="back-tag">Scheduling</span>
                      <span className="back-tag">Clients</span>
                      <span className="back-tag">Sessions</span>
                      <span className="back-tag">Rescheduling</span>
                    </div>
                    <Link to="/" className="btn" style={{marginTop: '1cqw'}} onClick={(e) => e.stopPropagation()}>
                      Open Calendar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Map Card */}
          <div 
            className={`bento-card expand-card ${expandedCard === 'studio-map' ? 'is-expanded' : ''}`} 
            data-expand="studio-map"
            onClick={() => handleCardClick('studio-map')}
          >
            <div className="card-inner">
              <div className="card-front brand-front">
                <span className="expand-hint" aria-hidden="true"></span>
                <div className="tab-label">STUDIO MAP</div>
              </div>
              <div className="card-back">
                <button className="expand-close" aria-label="Flip back" onClick={(e) => { e.stopPropagation(); handleCardClick('studio-map'); }}>←</button>
                <div className="back-content compact centered" style={{textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>
                  <h3 className="back-company" style={{marginBottom: '1.5cqw', fontSize: '5cqw'}}>Equipment Tracker</h3>
                  <p className="back-desc" style={{marginBottom: '4cqw', fontSize: '2.2cqw', color: '#aaa'}}>
                    Monitor all studio equipment availability, track items in repair, and manage inventory.
                  </p>
                  <Link to="/studio-map" className="btn" onClick={(e) => e.stopPropagation()} style={{padding: '2cqw 5cqw', fontSize: '2.5cqw'}}>
                    View Studio Map
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Card */}
          <div 
            className={`bento-card expand-card ${expandedCard === 'staff' ? 'is-expanded' : ''}`} 
            data-expand="staff"
            onClick={() => handleCardClick('staff')}
          >
            <div className="card-inner">
              <div className="card-front design-front">
                <span className="expand-hint" aria-hidden="true"></span>
                <div className="tab-label is-comic">STAFF</div>
              </div>
              <div className="card-back">
                <button className="expand-close" aria-label="Flip back" onClick={(e) => { e.stopPropagation(); handleCardClick('staff'); }}>←</button>
                <div className="back-content compact centered">
                  <h3 className="back-company" style={{color: '#666'}}>Team Management</h3>
                  <p className="back-desc" style={{margin: '2cqw 0', color: '#aaa'}}>Configure policies, manage availability, and track follow-ups.</p>
                  <Link to="/staff" className="btn" onClick={(e) => e.stopPropagation()}>
                    Access Staff Hub
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Title Card */}
          <div className="bento-card uipedia-card interactive-card flex-center">
            <h1 className="logo-title">
              <span>/S</span>tudio<span className="serif"> Booking</span>
            </h1>
          </div>

          {/* Complaints Card */}
          <div 
            className={`bento-card expand-card ${expandedCard === 'complaints' ? 'is-expanded' : ''}`} 
            data-expand="complaints"
            onClick={() => handleCardClick('complaints')}
          >
            <div className="card-inner">
              <div className="card-front editor-front">
                <span className="expand-hint" aria-hidden="true"></span>
                <div className="tab-label">COMPLAINTS</div>
              </div>
              <div className="card-back">
                <button className="expand-close" aria-label="Flip back" onClick={(e) => { e.stopPropagation(); handleCardClick('complaints'); }}>←</button>
                <div className="back-content split-layout">
                  <div className="split-col">
                    <h3 className="back-company">Issue Tracking</h3>
                    <div className="client-list tight">
                      <div className="client-entry" style={{borderLeftColor: '#FF4B2B'}}>
                        <div className="entry-info">
                          <strong>Log Complaints</strong>
                          <span className="entry-meta">Track all client issues</span>
                        </div>
                        <span className="entry-status active" style={{borderColor: '#FF4B2B', background: '#FF4B2B'}}></span>
                      </div>
                      <div className="client-entry" style={{borderLeftColor: '#00B4DB'}}>
                        <div className="entry-info">
                          <strong>Resolution Status</strong>
                          <span className="entry-meta">Monitor progress</span>
                        </div>
                        <span className="entry-status active" style={{borderColor: '#00B4DB', background: '#00B4DB'}}></span>
                      </div>
                      <div className="client-entry" style={{borderLeftColor: '#00D287'}}>
                        <div className="entry-info">
                          <strong>Time Tracking</strong>
                          <span className="entry-meta">Resolution metrics</span>
                        </div>
                        <span className="entry-status" style={{borderColor: '#aaa'}}></span>
                      </div>
                    </div>
                  </div>
                  <div className="split-col">
                    <h3 className="back-company">Client Care</h3>
                    <p className="back-role">Quality Assurance</p>
                    <div className="back-divider"></div>
                    <p className="back-desc">
                      Maintain detailed records of all complaints, track resolution times, and ensure client satisfaction.
                    </p>
                    <Link to="/complaints" className="btn" onClick={(e) => e.stopPropagation()} style={{marginTop: 'auto'}}>
                      View Complaints
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card - Placeholder */}
          <div className="bento-card resources-card" id="head-card">
            <div className="card-inner">
              <div className="card-front contact-front" style={{overflow: 'hidden', borderRadius: 'inherit', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'}}>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2cqw'}}>
                  <h3 className="back-company" style={{fontSize: '3cqw', marginBottom: '1cqw'}}>Need Help?</h3>
                  <p className="back-desc" style={{color: '#aaa', textAlign: 'center'}}>Contact your studio administrator for support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Card */}
          <div 
            className={`bento-card gradient-card expand-card ${expandedCard === 'subtitle' ? 'is-expanded' : ''}`} 
            data-expand="subtitle"
            onClick={() => handleCardClick('subtitle')}
          >
            <div className="card-inner">
              <div className="card-front subtitle-front">
                <span className="expand-hint" aria-hidden="true"></span>
                <h2 className="subtitle">Management, & the intelligence within.</h2>
              </div>
              <div className="card-back">
                <button className="expand-close" aria-label="Flip back" onClick={(e) => { e.stopPropagation(); handleCardClick('subtitle'); }}>←</button>
                <div className="back-content compact centered">
                  <h3 className="back-company" style={{color: '#666'}}>More Coming Soon</h3>
                </div>
              </div>
            </div>
          </div>

          {/* About/Bio Card */}
          <div 
            className={`bento-card explore-card expand-card ${expandedCard === 'about' ? 'is-expanded' : ''}`} 
            data-expand="about"
            onClick={() => handleCardClick('about')}
          >
            <div className="card-inner">
              <div className="card-front bio-front">
                <span className="expand-hint" aria-hidden="true"></span>
                <div className="bio-text">
                  <p><strong>Comprehensive Studio Platform</strong> and <strong>Management Solution</strong>.</p>
                  <p>Streamlining operations for modern studios with integrated booking, tracking, and client care.</p>
                  <p className="italic">All your studio needs in one elegant interface.</p>
                </div>
              </div>
              <div className="card-back">
                <button className="expand-close" aria-label="Flip back" onClick={(e) => { e.stopPropagation(); handleCardClick('about'); }}>←</button>
                <div className="back-content bio-expanded">
                  <h3 className="back-company">Core Features</h3>
                  <div className="skills-grid-mobile">
                    <div className="skill-group">
                      <h4 className="skill-cat">Booking</h4>
                      <div className="skill-icons">
                        <span className="icon-wrap" data-tooltip="Calendar">📅</span>
                        <span className="icon-wrap" data-tooltip="Sessions">⏰</span>
                        <span className="icon-wrap" data-tooltip="Clients">👥</span>
                        <span className="icon-wrap" data-tooltip="Reschedule">🔄</span>
                      </div>
                    </div>
                    <div className="skill-group">
                      <h4 className="skill-cat">Management</h4>
                      <div className="skill-icons">
                        <span className="icon-wrap" data-tooltip="Equipment">🎯</span>
                        <span className="icon-wrap" data-tooltip="Staff">👨‍💼</span>
                        <span className="icon-wrap" data-tooltip="Settings">⚙️</span>
                        <span className="icon-wrap" data-tooltip="Reports">📊</span>
                      </div>
                    </div>
                    <div className="skill-group">
                      <h4 className="skill-cat">Client Care</h4>
                      <div className="skill-icons">
                        <span className="icon-wrap" data-tooltip="Complaints">⚠️</span>
                        <span className="icon-wrap" data-tooltip="Follow-ups">📞</span>
                        <span className="icon-wrap" data-tooltip="Reviews">⭐</span>
                        <span className="icon-wrap" data-tooltip="Support">💬</span>
                      </div>
                    </div>
                    <div className="skill-group">
                      <h4 className="skill-cat">Analytics</h4>
                      <div className="skill-icons">
                        <span className="icon-wrap" data-tooltip="Attendance">✅</span>
                        <span className="icon-wrap" data-tooltip="Metrics">📈</span>
                        <span className="icon-wrap" data-tooltip="Capacity">📊</span>
                        <span className="icon-wrap" data-tooltip="Trends">📉</span>
                      </div>
                    </div>
                  </div>
                  <div className="back-divider"></div>
                  <div className="bio-bottom-row">
                    <div className="bio-bottom-col">
                      <h3 className="back-company">Technology</h3>
                      <p className="back-role">Modern Stack</p>
                      <span className="back-meta" style={{marginTop:'0.5cqw'}}>React · Vite</span>
                      <span className="back-meta">Supabase · Tailwind</span>
                    </div>
                    <div className="bio-bottom-col">
                      <h3 className="back-company">Design</h3>
                      <div className="lang-row" style={{flexDirection: 'column', gap: '0.8cqw', marginTop: '0.8cqw'}}>
                        <div className="lang-item">
                          <span className="lang-label">Interface</span>
                          <span className="lang-level">Bento Grid</span>
                        </div>
                        <div className="lang-item">
                          <span className="lang-label">Theme</span>
                          <span className="lang-level">Dark Mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoLanding;
