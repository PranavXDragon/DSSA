import { useEffect, useState, useRef } from 'react';

export default function Admin() {
  const [data, setData] = useState<Record<string, any>>({});
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [menuData, setMenuData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'media' | 'projects' | 'menu' | 'settings' | 'team' | 'faculty' | 'cards'>('text');
  const [backboneData, setBackboneData] = useState<any[]>([]);
  const [facultyData, setFacultyData] = useState<any[]>([]);
  const [cardsData, setCardsData] = useState<Record<string, any[]>>({ gallery: [], roadmap: [], chapter: [], quest: [], welcome: [], beginning: [], vision: [], foundation: [], journey: [] });
  const [cardSection, setCardSection] = useState<string>('gallery');

  const [textFields, setTextFields] = useState<{ key: string, value: string }[]>([]);
  const [mediaFields, setMediaFields] = useState<{ key: string, value: any, src: string, format: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/uil.1746999829739.json?v=' + Date.now()).then(res => res.json()),
      fetch('/assets/data/cms_projects.json?v=' + Date.now()).then(res => res.json()),
      fetch('/assets/data/cms_menu.json?v=' + Date.now()).then(res => res.json()).catch(() => null),
      fetch('/assets/data/cms_settings.json?v=' + Date.now()).then(res => res.json()).catch(() => null),
      fetch('/assets/data/our_backbone_team.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/faculty_leadership_team.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/gallery_images.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/roadmap_events.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/next_chapter.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/quest_events.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/welcome_dssa.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/beginning_events.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/our-vision_data.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/building-the-foundation_data.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/our-journey_data.json?v=' + Date.now()).then(res => res.json()).catch(() => []),
      fetch('/assets/data/innovation-in-action_data.json?v=' + Date.now()).then(res => res.json()).catch(() => [])
    ]).then(([json, projects, menu, settings, backbone, faculty, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10]) => {
        setProjectsData(projects);
        setMenuData(menu);
        setSettingsData(settings || { logoScale: 2.1 });
        setBackboneData(backbone || []);
        setFacultyData(faculty || []);
        setCardsData({
          gallery: c1 || [],
          roadmap: c2 || [],
          chapter: c3 || [],
          quest: c4 || [],
          welcome: c5 || [],
          beginning: c6 || [],
          vision: c7 || [],
          foundation: c8 || [],
          journey: c9 || [],
          innovation: c10 || []
        });

        const tFields: { key: string, value: string }[] = [];
        const mFields: { key: string, value: any, src: string, format: string }[] = [];

        const sortedKeys = Object.keys(json).sort();
        for (const key of sortedKeys) {
          const val = json[key];
          if (key.endsWith('_text3d_text')) {
            tFields.push({ key, value: val });
          } else if (
            key.includes('_tx_t') || key.includes('_txt') || key.includes('texture') ||
            (typeof val === 'string' && (val.includes('.png') || val.includes('.jpg') || val.includes('.mp4') || val.includes('assets/images/')))
          ) {
            let src = '';
            let format = 'string';
            
            if (typeof val === 'string') {
              if (val.startsWith('{') && val.includes('"src"')) {
                try {
                  const obj = JSON.parse(val);
                  src = obj.src;
                  format = 'stringified_object';
                } catch (e) {
                  src = val;
                }
              } else {
                src = val;
              }
            } else if (typeof val === 'object' && val !== null && val.src) {
              src = val.src;
              format = 'object';
            }

            if (src && typeof src === 'string' && src.length > 0) {
               mFields.push({ key, value: val, src, format });
            }
          }
        }
        setTextFields(tFields);
        setMediaFields(mFields);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updates: Record<string, any> = {};
    
    textFields.forEach(f => {
      updates[f.key] = f.value;
    });

    mediaFields.forEach(f => {
      let finalValue = f.value;
      if (f.format === 'object') {
        finalValue = { ...f.value, src: f.src };
      } else if (f.format === 'stringified_object') {
        try {
          const obj = JSON.parse(f.value);
          obj.src = f.src;
          finalValue = JSON.stringify(obj);
        } catch (e) {
          finalValue = f.src;
        }
      } else {
        finalValue = f.src;
      }
      updates[f.key] = finalValue;
    });

    const orderedProjects = projectsData.map((proj, idx) => ({
      ...proj,
      priority: idx + 1
    }));

    try {
      const res = await fetch('/api/save-uil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uil: updates, projects: orderedProjects, menu: menuData, settings: settingsData, backbone: backboneData, faculty: facultyData, cardsData: cardsData })
      });
      if (res.ok) {
        alert('Saved! Refresh the page to see changes.');
      } else {
        alert('Failed to save.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving data.');
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (key: string, newValue: string) => {
    setTextFields(prev => prev.map(f => f.key === key ? { ...f, value: newValue } : f));
  };

  const handleMediaChange = (key: string, newSrc: string) => {
    setMediaFields(prev => prev.map(f => f.key === key ? { ...f, src: newSrc } : f));
  };

  const handleProjectChange = (index: number, field: string, newValue: string) => {
    setProjectsData((prev: any) => {
      const newProjects = [...prev];
      if (field.includes('.')) {
        const parts = field.split('.');
        newProjects[index][parts[0]][parts[1]] = newValue;
      } else {
        newProjects[index][field] = newValue;
      }
      return newProjects;
    });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    setProjectsData((prev: any) => {
      const newProjects = [...prev];
      if (direction === 'up' && index > 0) {
        [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]];
      } else if (direction === 'down' && index < newProjects.length - 1) {
        [newProjects[index + 1], newProjects[index]] = [newProjects[index], newProjects[index + 1]];
      }
      return newProjects;
    });
  };

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      setProjectsData((prev: any) => {
        const newProjects = [...prev];
        const draggedItemContent = newProjects.splice(dragItem.current!, 1)[0];
        newProjects.splice(dragOverItem.current!, 0, draggedItemContent);
        return newProjects;
      });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleMenuChange = (field: string, newValue: string, itemIdx?: number) => {
    setMenuData((prev: any) => {
      if (!prev) return prev;
      const newData = { ...prev };
      if (itemIdx !== undefined && newData.items) {
        newData.items[itemIdx][field] = newValue;
      } else {
        newData[field] = newValue;
      }
      return newData;
    });
  };

  const handleSettingChange = (field: string, newValue: any) => {
    setSettingsData((prev: any) => ({ ...prev, [field]: newValue }));
  };

  if (loading) return null;

  return (
    <>
      <button 
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 999999,
          padding: '12px 20px', background: '#3b82f6', color: 'white', 
          border: 'none', borderRadius: '8px', cursor: 'pointer',
          fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
        onClick={() => setVisible(!visible)}
      >
        {visible ? 'Close Admin' : 'Open CMS Admin'}
      </button>

      {visible && (
        <div style={{
          position: 'fixed', top: '20px', right: '10px', bottom: '80px', width: 'calc(100% - 20px)', maxWidth: '500px',
          background: 'rgba(20, 20, 25, 0.95)', border: '1px solid #333', 
          borderRadius: '12px', zIndex: 999998, display: 'flex', flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>WebGL Content Editor</h2>
            <button 
              onClick={handleSave} 
              disabled={saving}
              style={{
                background: '#10b981', color: 'white', border: 'none', 
                padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #333', background: '#111' }}>
            <button 
              onClick={() => setActiveTab('text')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'text' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Text ({textFields.length})
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'media' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Media ({mediaFields.length})
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'projects' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Works ({projectsData.length})
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'menu' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'settings' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Settings
            </button>

            <button 
              onClick={() => setActiveTab('team')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'team' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Team
            </button>
            <button 
              onClick={() => setActiveTab('faculty')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'faculty' ? '#333' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Faculty
            </button>
            <button 
              onClick={() => setActiveTab('cards')}
              style={{ flex: 1, padding: '10px 5px', background: activeTab === 'cards' ? '#333' : 'transparent', color: '#00f0ff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              📽️ Video Cards
            </button>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'settings' && settingsData && (
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>
                  3D Logo Scale: {settingsData.logoScale}
                </label>
                <input 
                  type="range" 
                  min="0.1" max="5.0" step="0.1"
                  value={settingsData.logoScale || 2.1} 
                  onChange={e => handleSettingChange('logoScale', Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '24px', cursor: 'pointer' }}
                />
                <p style={{ color: '#666', fontSize: '12px' }}>
                  Adjust the size of the 3D logo in the center of the screen. (Default is 2.1)
                </p>
              </div>
            )}
            {activeTab === 'team' && (
              <div>
                <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                  Edit names, roles, departments, and photo URLs or local paths (like <code>/assets/team/photo.jpg</code>). Clicking <b>Save Changes</b> above will automatically regenerate the 3D team videos!
                </div>

                {backboneData.map((member: any, idx: number) => (
                  <div key={idx} style={{ background: '#1c1c24', border: '1px solid #333', borderRadius: '8px', padding: '12px', marginBottom: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '14px' }}>#{idx + 1} {member.name || 'New Member'}</span>
                      <button
                        onClick={() => {
                          setBackboneData(prev => prev.filter((_, i) => i !== idx));
                        }}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Name</label>
                        <input
                          type="text"
                          value={member.name || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setBackboneData(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Role / Title</label>
                        <input
                          type="text"
                          value={member.role || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setBackboneData(prev => prev.map((m, i) => i === idx ? { ...m, role: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Department / Year</label>
                        <input
                          type="text"
                          value={member.dept || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setBackboneData(prev => prev.map((m, i) => i === idx ? { ...m, dept: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Division</label>
                        <input
                          type="text"
                          value={member.div || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setBackboneData(prev => prev.map((m, i) => i === idx ? { ...m, div: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Photo URL or Path (/assets/team/...)</label>
                      <input
                        type="text"
                        value={member.photo || member.url || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setBackboneData(prev => prev.map((m, i) => i === idx ? { ...m, photo: val, url: val } : m));
                        }}
                        style={{ width: '100%', background: '#111', border: '1px solid #444', color: '#38bdf8', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Bio / Description</label>
                      <textarea
                        rows={2}
                        value={member.bio || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setBackboneData(prev => prev.map((m, i) => i === idx ? { ...m, bio: val } : m));
                        }}
                        style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newMember = {
                      role: "COORDINATOR",
                      name: "New Member",
                      dept: "B.Tech Data Science · 1st Yr",
                      div: "TECHNICAL DIVISION",
                      bio: "Contributing to technical projects and events.",
                      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    };
                    setBackboneData(prev => [...prev, newMember]);
                  }}
                  style={{
                    width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px'
                  }}
                >
                  + Add Team Member
                </button>
              </div>
            )}
            {activeTab === 'faculty' && (
              <div>
                <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                  Edit names, roles, departments, and photo URLs or local paths (like <code>/assets/team/photo.jpg</code>). Clicking <b>Save Changes</b> above will automatically regenerate the 3D team videos!
                </div>

                {facultyData.map((member: any, idx: number) => (
                  <div key={idx} style={{ background: '#1c1c24', border: '1px solid #333', borderRadius: '8px', padding: '12px', marginBottom: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '14px' }}>#{idx + 1} {member.name || 'New Member'}</span>
                      <button
                        onClick={() => {
                          setFacultyData(prev => prev.filter((_, i) => i !== idx));
                        }}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Name</label>
                        <input
                          type="text"
                          value={member.name || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setFacultyData(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Role / Title</label>
                        <input
                          type="text"
                          value={member.role || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setFacultyData(prev => prev.map((m, i) => i === idx ? { ...m, role: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Department / Year</label>
                        <input
                          type="text"
                          value={member.dept || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setFacultyData(prev => prev.map((m, i) => i === idx ? { ...m, dept: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Division</label>
                        <input
                          type="text"
                          value={member.div || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setFacultyData(prev => prev.map((m, i) => i === idx ? { ...m, div: val } : m));
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Photo URL or Path (/assets/team/...)</label>
                      <input
                        type="text"
                        value={member.photo || member.url || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setFacultyData(prev => prev.map((m, i) => i === idx ? { ...m, photo: val, url: val } : m));
                        }}
                        style={{ width: '100%', background: '#111', border: '1px solid #444', color: '#38bdf8', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Bio / Description</label>
                      <textarea
                        rows={2}
                        value={member.bio || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setFacultyData(prev => prev.map((m, i) => i === idx ? { ...m, bio: val } : m));
                        }}
                        style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newMember = {
                      role: "FACULTY",
                      name: "New Member",
                      dept: "Data Science",
                      div: "FACULTY",
                      bio: "Faculty member.",
                      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    };
                    setFacultyData(prev => [...prev, newMember]);
                  }}
                  style={{
                    width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px'
                  }}
                >
                  + Add Faculty Member
                </button>
              </div>
            )}
            {activeTab === 'menu' && menuData && (
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Main Title</label>
                <input 
                  type="text" value={menuData.title || ''} onChange={e => handleMenuChange('title', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '24px' }}
                />
                
                <h3 style={{ color: '#10b981', margin: '0 0 16px 0' }}>Menu Links</h3>
                {menuData.items && menuData.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '16px', padding: '12px', background: '#1a1a1a', borderRadius: '8px' }}>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Label (e.g. {'->'} WEBSITES)</label>
                    <input 
                      type="text" value={item.label || ''} onChange={e => handleMenuChange('label', e.target.value, idx)}
                      style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                    />
                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Tag / Category Match (e.g. Website)</label>
                    <input 
                      type="text" value={item.tag || ''} onChange={e => handleMenuChange('tag', e.target.value, idx)}
                      style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'text' && textFields.map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '8px', fontFamily: 'monospace' }}>
                  {field.key.replace('INPUT_Element_', '').replace('_text3d_text', '')}
                </label>
                <textarea 
                  value={field.value}
                  onChange={e => handleTextChange(field.key, e.target.value)}
                  style={{
                    width: '100%', minHeight: '80px', background: '#000', 
                    color: '#fff', border: '1px solid #444', borderRadius: '6px',
                    padding: '8px', fontFamily: 'sans-serif', resize: 'vertical'
                  }}
                />
              </div>
            ))}

            {activeTab === 'media' && mediaFields.map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '8px', fontFamily: 'monospace' }}>
                  {field.key}
                </label>
                <input 
                  type="text"
                  value={field.src}
                  onChange={e => handleMediaChange(field.key, e.target.value)}
                  style={{
                    width: '100%', background: '#000', 
                    color: '#fff', border: '1px solid #444', borderRadius: '6px',
                    padding: '8px', fontFamily: 'sans-serif'
                  }}
                />
                {field.src && (field.src.endsWith('.jpg') || field.src.endsWith('.png')) && (
                   <img src={field.src.startsWith('http') ? field.src : `/${field.src.split('?')[0]}`} style={{ maxWidth: '100%', marginTop: '8px', borderRadius: '4px', border: '1px solid #333' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
            ))}

            {activeTab === 'projects' && projectsData.map((project, idx) => (
              <div 
                key={project.id || idx} 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #333', cursor: 'grab' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#10b981', margin: 0 }}>Panel {idx + 1}: <span style={{color: 'white'}}>{project.name || 'Untitled Project'}</span></h3>
                  <div>
                    <button onClick={() => moveProject(idx, 'up')} disabled={idx === 0} style={{ background: '#333', color: 'white', border: 'none', padding: '4px 8px', marginRight: '4px', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>↑ Up</button>
                    <button onClick={() => moveProject(idx, 'down')} disabled={idx === projectsData.length - 1} style={{ background: '#333', color: 'white', border: 'none', padding: '4px 8px', cursor: idx === projectsData.length - 1 ? 'not-allowed' : 'pointer' }}>↓ Down</button>
                  </div>
                </div>
                
                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Title</label>
                <input 
                  type="text" value={project.name || ''} onChange={e => handleProjectChange(idx, 'name', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />

                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Subtitle</label>
                <input 
                  type="text" value={project.clientName || ''} onChange={e => handleProjectChange(idx, 'clientName', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />

                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Year (e.g. 2024)</label>
                <input 
                  type="text" value={project.completionDate || ''} 
                  onChange={e => handleProjectChange(idx, 'completionDate', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />

                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Category (e.g. Website)</label>
                <input 
                  type="text" value={project.tags || ''} onChange={e => handleProjectChange(idx, 'tags', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />

                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Description</label>
                <textarea 
                  value={project.description || ''} onChange={e => handleProjectChange(idx, 'description', e.target.value)}
                  style={{ width: '100%', minHeight: '60px', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />

                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Video URL</label>
                <input 
                  type="text" value={project.video?.url || ''} onChange={e => handleProjectChange(idx, 'video.url', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />

                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Video Thumbnail</label>
                <input 
                  type="text" value={project.video?.thumbnail || ''} onChange={e => handleProjectChange(idx, 'video.thumbnail', e.target.value)}
                  style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '8px', marginBottom: '12px' }}
                />
                
                {project.video?.thumbnail && (
                   <img src={project.video.thumbnail} style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid #333' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
            ))}
            {activeTab === 'cards' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', background: '#111', padding: '10px', borderRadius: '8px' }}>
                  {['gallery', 'roadmap', 'chapter', 'quest', 'welcome', 'beginning', 'vision', 'foundation', 'journey', 'innovation'].map(sec => (
                    <button 
                      key={sec} 
                      onClick={() => setCardSection(sec)} 
                      style={{ padding: '6px 12px', borderRadius: '16px', background: cardSection === sec ? '#00f0ff' : '#333', color: cardSection === sec ? 'black' : 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                      {sec.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '16px', fontSize: '12px', color: '#aaa', lineHeight: '1.5', background: '#111', padding: '10px', borderRadius: '6px', border: '1px solid #333' }}>
                  <b style={{ color: '#00f0ff' }}>📽️ {cardSection.toUpperCase()} · Auto-Video Generator</b><br/>
                  Edit text and photos below. Clicking <b>Save Changes</b> will automatically run the Python rendering engine and regenerate the final MP4 video for this section! (Takes ~30 seconds).
                </div>

                {(cardsData[cardSection] || []).map((card: any, idx: number) => (
                  <div key={idx} style={{ background: '#1c1c24', border: '1px solid #00f0ff33', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '14px' }}>Slide #{idx + 1}</span>
                      <button
                        onClick={() => {
                          setCardsData(prev => {
                             const arr = [...(prev[cardSection] || [])];
                             arr.splice(idx, 1);
                             return { ...prev, [cardSection]: arr };
                          });
                        }}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '8px' }}>
                      {cardSection === 'roadmap' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Month (e.g. AUG)</label>
                            <input
                              type="text"
                              value={card.month || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setCardsData(prev => {
                                   const arr = [...(prev[cardSection] || [])];
                                   arr[idx] = { ...arr[idx], month: val };
                                   return { ...prev, [cardSection]: arr };
                                });
                              }}
                              style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Year (e.g. 2025)</label>
                            <input
                              type="text"
                              value={card.year || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setCardsData(prev => {
                                   const arr = [...(prev[cardSection] || [])];
                                   arr[idx] = { ...arr[idx], year: val };
                                   return { ...prev, [cardSection]: arr };
                                });
                              }}
                              style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Title</label>
                        <input
                          type="text"
                          value={card.title || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setCardsData(prev => {
                               const arr = [...(prev[cardSection] || [])];
                               arr[idx] = { ...arr[idx], title: val };
                               return { ...prev, [cardSection]: arr };
                            });
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Subtitle / Description / Quote</label>
                        <input
                          type="text"
                          value={card.desc || card.quote || card.subtitle || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setCardsData(prev => {
                               const arr = [...(prev[cardSection] || [])];
                               arr[idx] = { ...arr[idx], desc: val };
                               return { ...prev, [cardSection]: arr };
                            });
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '13px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Photo URL (Direct link to image)</label>
                        <input
                          type="text"
                          value={card.photo || card.url || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setCardsData(prev => {
                               const arr = [...(prev[cardSection] || [])];
                               arr[idx] = { ...arr[idx], photo: val };
                               return { ...prev, [cardSection]: arr };
                            });
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: '#38bdf8', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
                        />
                      </div>
                      
                      {/* Optional Color */}
                      <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '11px', marginBottom: '2px' }}>Accent Color RGB (e.g. 255,100,50) - Optional</label>
                        <input
                          type="text"
                          value={Array.isArray(card.color) ? card.color.join(',') : ''}
                          onChange={e => {
                            const val = e.target.value;
                            const rgb = val.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                            setCardsData(prev => {
                               const arr = [...(prev[cardSection] || [])];
                               if (rgb.length === 3) arr[idx] = { ...arr[idx], color: rgb };
                               return { ...prev, [cardSection]: arr };
                            });
                          }}
                          style={{ width: '100%', background: '#111', border: '1px solid #444', color: '#8b5cf6', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                     setCardsData(prev => {
                        const arr = [...(prev[cardSection] || [])];
                        arr.push({ title: "New Slide", desc: "Description here", photo: "", color: [0, 200, 255], month: cardSection === 'roadmap' ? 'JAN' : undefined, year: cardSection === 'roadmap' ? '2026' : undefined });
                        return { ...prev, [cardSection]: arr };
                     });
                  }}
                  style={{ width: '100%', background: '#00f0ff', color: 'black', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}
                >
                  + Add Slide to {cardSection.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
