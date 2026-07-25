import { useEffect, useState, useRef } from 'react';

export default function Admin() {
  const [data, setData] = useState<Record<string, any>>({});
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [menuData, setMenuData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'media' | 'projects' | 'menu' | 'settings'>('text');

  const [textFields, setTextFields] = useState<{ key: string, value: string }[]>([]);
  const [mediaFields, setMediaFields] = useState<{ key: string, value: any, src: string, format: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/uil.1746999829739.json?v=' + Date.now()).then(res => res.json()),
      fetch('/assets/data/cms_projects.json?v=' + Date.now()).then(res => res.json()),
      fetch('/assets/data/cms_menu.json?v=' + Date.now()).then(res => res.json()).catch(() => null),
      fetch('/assets/data/cms_settings.json?v=' + Date.now()).then(res => res.json()).catch(() => null)
    ]).then(([json, projects, menu, settings]) => {
        setData(json);
        setProjectsData(projects);
        setMenuData(menu);
        setSettingsData(settings || { logoScale: 2.1 });

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
        body: JSON.stringify({ uil: updates, projects: orderedProjects, menu: menuData, settings: settingsData })
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

          <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#111' }}>
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
          </div>
        </div>
      )}
    </>
  );
}
