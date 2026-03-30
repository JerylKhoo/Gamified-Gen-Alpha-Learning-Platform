import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function formatId(id) {
  if (!id) return '';
  return id.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function ModuleEditorPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const ext = file.name.split('.').pop();
      const path = `${moduleId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('module').upload(path, file);
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from('module').getPublicUrl(path);
      return data.publicUrl;
    },
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saved, setSaved] = useState(false);

  // Load existing content once editor is ready
  useEffect(() => {
    if (!editor || loaded) return;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/api/v1/modules/${encodeURIComponent(moduleId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const mod = await res.json();
          if (mod.content) {
            const blocks = await editor.tryParseHTMLToBlocks(mod.content);
            editor.replaceBlocks(editor.document, blocks);
          }
        }
      } catch { /* editor stays empty */ }
      setLoaded(true);
    })();
  }, [editor, moduleId, loaded]);

  async function handleSave() {
    setSaving(true); setSaveErr(''); setSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Serialize new content
      const newHtml = await editor.blocksToHTMLLossy(editor.document);

      // Extract filenames referenced in the new HTML (from module bucket URLs)
      const referencedNames = new Set(
        [...newHtml.matchAll(/\/storage\/v1\/object\/public\/module\/[^/"?]+\/([^/"?]+)/g)]
          .map(m => decodeURIComponent(m[1]))
      );

      // List all files in this module's bucket folder and delete unreferenced ones
      const { data: bucketFiles } = await supabase.storage.from('module').list(moduleId);
      if (bucketFiles && bucketFiles.length > 0) {
        const toDelete = bucketFiles
          .filter(f => !referencedNames.has(f.name))
          .map(f => `${moduleId}/${f.name}`);
        if (toDelete.length > 0) {
          await supabase.storage.from('module').remove(toDelete);
        }
      }

      // Save new content
      const res = await fetch(`${API_URL}/api/v1/modules/${encodeURIComponent(moduleId)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newHtml }),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Save failed');

      // Navigate back to the course page
      navigate(-1);
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0f18', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', flexShrink: 0,
        background: '#0d0f18', borderBottom: '1px solid rgba(139,92,246,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b6490', cursor: 'pointer', fontSize: 13 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{ color: '#f0eeff', fontSize: 13, fontWeight: 600 }}>{formatId(moduleId)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveErr && <span style={{ color: '#f87171', fontSize: 12 }}>{saveErr}</span>}
          {saved   && <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 600 }}>Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '6px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1, boxShadow: '0 2px 12px rgba(139,92,246,0.35)',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#111320' }}>
        <BlockNoteView
          editor={editor}
          theme="dark"
          style={{ minHeight: '100%' }}
        />
      </div>

      {/* Theme tweaks to match app palette */}
      <style>{`
        .bn-container[data-color-scheme="dark"] {
          --bn-colors-editor-background: #111320;
          --bn-colors-editor-text: #f0eeff;
          --bn-colors-menu-background: #1a1c2e;
          --bn-colors-tooltip-background: #1a1c2e;
          --bn-colors-tooltip-text: #c4b5fd;
          --bn-colors-hovered-background: rgba(139,92,246,0.12);
          --bn-colors-selected-background: rgba(139,92,246,0.2);
          --bn-colors-disabled-background: rgba(255,255,255,0.04);
          --bn-colors-shadow: rgba(0,0,0,0.5);
          --bn-colors-border: rgba(139,92,246,0.2);
          --bn-colors-side-menu: #4b4870;
          --bn-colors-highlights-gray-background: rgba(255,255,255,0.06);
          --bn-colors-highlights-gray-text: #9090b0;
          --bn-font-family: 'Inter', sans-serif;
        }
        .bn-editor { padding: 40px max(60px, calc(50% - 380px)) !important; }
        .bn-block-outer:hover .bn-block-handle { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
