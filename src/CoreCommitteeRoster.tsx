import React, { useEffect, useState, useRef } from 'react';

interface Member {
  id: number;
  role: string;
  name: string;
  department: string;
  badge: string;
  badgeColor: string;
  photo: string;
  initials: string;
}

const COMMITTEE_MEMBERS: Member[] = [
  {
    id: 1,
    role: "President",
    name: "Aarav Sharma",
    department: "B.Tech Data Science · 4th Yr",
    badge: "EXECUTIVE",
    badgeColor: "#00f0ff",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    initials: "AS"
  },
  {
    id: 2,
    role: "Vice President",
    name: "Ananya Verma",
    department: "B.Tech AI & ML · 4th Yr",
    badge: "EXECUTIVE",
    badgeColor: "#00f0ff",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    initials: "AV"
  },
  {
    id: 3,
    role: "General Secretary",
    name: "Rohan Mehta",
    department: "B.Tech Data Science · 3rd Yr",
    badge: "ADMIN",
    badgeColor: "#b76cfd",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    initials: "RM"
  },
  {
    id: 4,
    role: "Treasurer",
    name: "Priya Nair",
    department: "B.Tech Data Science · 3rd Yr",
    badge: "FINANCE",
    badgeColor: "#ffaa00",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
    initials: "PN"
  },
  {
    id: 5,
    role: "Technical Head",
    name: "Vikramaditya Rao",
    department: "B.Tech AI & ML · 4th Yr",
    badge: "TECHNICAL",
    badgeColor: "#00ff88",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
    initials: "VR"
  },
  {
    id: 6,
    role: "Co-Technical Head",
    name: "Siddharth Joshi",
    department: "B.Tech Comp Sci · 3rd Yr",
    badge: "TECHNICAL",
    badgeColor: "#00ff88",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80",
    initials: "SJ"
  },
  {
    id: 7,
    role: "Events & Operations Head",
    name: "Neha Gupta",
    department: "B.Tech Data Science · 3rd Yr",
    badge: "OPERATIONS",
    badgeColor: "#ff4477",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    initials: "NG"
  },
  {
    id: 8,
    role: "PR & Outreach Head",
    name: "Karan Singhania",
    department: "B.Tech AI & ML · 3rd Yr",
    badge: "OUTREACH",
    badgeColor: "#38b6ff",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
    initials: "KS"
  },
  {
    id: 9,
    role: "Creative & Design Head",
    name: "Riya Mukherjee",
    department: "B.Des / Data Science · 3rd Yr",
    badge: "CREATIVE",
    badgeColor: "#ff66cc",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    initials: "RM"
  },
  {
    id: 10,
    role: "Editorial & Content Head",
    name: "Aditya Kulkarni",
    department: "B.Tech Data Science · 3rd Yr",
    badge: "EDITORIAL",
    badgeColor: "#a288ff",
    photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80",
    initials: "AK"
  },
  {
    id: 11,
    role: "Marketing & Media Head",
    name: "Snigdha Chatterjee",
    department: "B.Tech AI & ML · 2nd Yr",
    badge: "MEDIA",
    badgeColor: "#ff8844",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    initials: "SC"
  },
  {
    id: 12,
    role: "Logistics & Security Head",
    name: "Devansh Patel",
    department: "B.Tech Data Science · 2nd Yr",
    badge: "LOGISTICS",
    badgeColor: "#00d4ff",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    initials: "DP"
  },
  {
    id: 13,
    role: "Research & AI Lead",
    name: "Tanvi Deshmukh",
    department: "B.Tech AI & ML · 4th Yr",
    badge: "RESEARCH",
    badgeColor: "#00ffcc",
    photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&auto=format&fit=crop&q=80",
    initials: "TD"
  },
  {
    id: 14,
    role: "Community Growth Lead",
    name: "Arjun Nair",
    department: "B.Tech Comp Sci · 2nd Yr",
    badge: "COMMUNITY",
    badgeColor: "#77aaff",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
    initials: "AN"
  }
];

export default function CoreCommitteeRoster() {
  const [isCommitteePage, setIsCommitteePage] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      const match = path.includes('/work/core-committee') || path.includes('/work/kaninsky-vr');
      if (match !== isCommitteePage) {
        setIsCommitteePage(match);
      }
    };

    checkPath();
    const interval = setInterval(checkPath, 150);
    window.addEventListener('popstate', checkPath);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', checkPath);
    };
  }, [isCommitteePage]);

  if (!isCommitteePage) return null;

  const handleImageError = (id: number) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '40px',
        right: '40px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'auto',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
    >
      {/* Dock Bar Title & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 18px',
          background: 'rgba(10, 15, 25, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', color: '#00f0ff', textTransform: 'uppercase' }}>
            CORE COMMITTEE ROSTER — 14 EXECUTIVE LEADERS
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '12px', display: 'none', md: 'inline' } as any}>
            Hover to inspect · Scroll horizontally
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => scroll('left')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00f0ff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00f0ff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Deck */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '10px',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 240, 255, 0.4) transparent'
        }}
      >
        {COMMITTEE_MEMBERS.map((member) => {
          const hasError = failedImages[member.id];
          return (
            <div
              key={member.id}
              style={{
                minWidth: '220px',
                width: '220px',
                height: '260px',
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.75), rgba(8, 12, 20, 0.85))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                flexShrink: 0
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.borderColor = member.badgeColor;
                e.currentTarget.style.boxShadow = `0 15px 35px ${member.badgeColor}40`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.5)';
              }}
            >
              {/* Role Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 2,
                  background: 'rgba(8, 12, 20, 0.85)',
                  border: `1px solid ${member.badgeColor}`,
                  color: member.badgeColor,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {member.badge}
              </div>

              {/* Photo Box */}
              <div
                style={{
                  width: '100%',
                  height: '170px',
                  position: 'relative',
                  background: '#0f172a',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!hasError ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    onError={() => handleImageError(member.id)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      filter: 'contrast(105%) saturate(95%)',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(183, 108, 253, 0.15))`
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: `2px solid ${member.badgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 800,
                        color: member.badgeColor,
                        background: 'rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      {member.initials}
                    </div>
                  </div>
                )}

                {/* Bottom dark gradient transition */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.6) 50%, transparent 100%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Member Details */}
              <div
                style={{
                  padding: '0 14px 14px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  marginTop: '-24px',
                  zIndex: 2,
                  position: 'relative'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: member.badgeColor,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {member.role}
                </span>
                <h3
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {member.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {member.department}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
