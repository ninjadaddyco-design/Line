import { useState, useRef } from 'react';
import { Upload, Save, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useSiteContent, useUpdateSiteContent, useSocialLinks, useUpsertSocialLink } from '@/hooks/useAdminData';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

const SECTIONS = [
  { key: 'hero', label: 'Hero Section', fields: ['headline', 'subheadline', 'cta_text', 'cta_link', 'bg_image', 'secondary_image'] },
  { key: 'editorial', label: 'Editorial Banner', fields: ['headline', 'subheadline', 'cta_text', 'cta_link', 'image'] },
  { key: 'brand_story', label: 'Brand Story', fields: ['headline', 'body', 'image'] },
  { key: 'shop_the_look', label: 'Shop the Look', fields: ['headline', 'subheadline', 'image'] },
  { key: 'social_section', label: 'Social / TikTok', fields: ['headline', 'subheadline'] },
  { key: 'newsletter', label: 'Newsletter', fields: ['headline', 'subheadline', 'placeholder', 'button_text'] },
];

const IMAGE_FIELDS = ['bg_image', 'secondary_image', 'image'];

export default function AdminContent() {
  const { data: siteContent } = useSiteContent();
  const { mutateAsync: updateContent } = useUpdateSiteContent();
  const { data: socialLinks } = useSocialLinks();
  const { mutateAsync: upsertSocialLink } = useUpsertSocialLink();
  const { upload, uploading } = useImageUpload('site-images');
  const [activeSection, setActiveSection] = useState('hero');
  const [localContent, setLocalContent] = useState<Record<string, string>>({});
  const [socialEdits, setSocialEdits] = useState<Record<string, string>>({});
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField, setUploadTargetField] = useState('');

  const current = SECTIONS.find((s) => s.key === activeSection)!;
  const contentData = { ...(siteContent?.[activeSection] || {}), ...localContent };

  const handleFieldChange = (field: string, value: string) => {
    setLocalContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const merged = { ...(siteContent?.[activeSection] || {}), ...localContent };
    await updateContent({ section: activeSection, content: merged });
    setLocalContent({});
  };

  const handleImageUpload = async (file: File) => {
    const url = await upload(file);
    if (url) {
      handleFieldChange(uploadTargetField, url);
      toast.success('Image uploaded — click Save Changes to apply');
    }
  };

  const handleSaveSocials = async () => {
    for (const [platform, url] of Object.entries(socialEdits)) {
      await upsertSocialLink({ platform, url, active: true });
    }
    if (newSocial.platform && newSocial.url) {
      await upsertSocialLink({ platform: newSocial.platform, url: newSocial.url, active: true });
      setNewSocial({ platform: '', url: '' });
    }
    setSocialEdits({});
  };

  const inputClass = 'w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]';

  return (
    <AdminLayout title="Content">
      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="bg-white border border-gray-100 h-fit">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => { setActiveSection(s.key); setLocalContent({}); }}
              className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors ${activeSection === s.key ? 'bg-[#0a0a0a] text-white' : 'hover:bg-gray-50'}`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => { setActiveSection('social'); setLocalContent({}); }}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${activeSection === 'social' ? 'bg-[#0a0a0a] text-white' : 'hover:bg-gray-50'}`}
          >
            Social Links
          </button>
        </div>

        {/* Content editor */}
        <div className="lg:col-span-3 bg-white border border-gray-100 p-5">
          {activeSection === 'social' ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm mb-4">Social Links</h3>
              {socialLinks?.map((link) => (
                <div key={link.platform} className="flex gap-3 items-center">
                  <span className="w-24 text-xs font-semibold uppercase tracking-wider text-gray-500 capitalize">{link.platform}</span>
                  <input
                    value={socialEdits[link.platform] !== undefined ? socialEdits[link.platform] : link.url}
                    onChange={(e) => setSocialEdits({ ...socialEdits, [link.platform]: e.target.value })}
                    className={`${inputClass} flex-1`}
                    placeholder={`https://${link.platform}.com/@yourhandle`}
                  />
                </div>
              ))}
              {/* Add new */}
              <div className="flex gap-3 items-center pt-2 border-t border-gray-100">
                <input value={newSocial.platform} onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })} className="border border-gray-200 px-3 py-2.5 text-sm w-28 focus:outline-none" placeholder="Platform" />
                <input value={newSocial.url} onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })} className={`${inputClass} flex-1`} placeholder="URL" />
                <button onClick={() => {}} className="flex items-center gap-1 text-xs font-semibold text-gray-500"><Plus size={12} /> Add</button>
              </div>
              <button onClick={handleSaveSocials} className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
                <Save size={14} /> SAVE SOCIAL LINKS
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{current.label}</h3>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors"
                >
                  <Save size={13} /> SAVE CHANGES
                </button>
              </div>

              {current.fields.map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 capitalize">
                    {field.replace(/_/g, ' ')}
                  </label>
                  {IMAGE_FIELDS.includes(field) ? (
                    <div className="space-y-2">
                      {contentData[field] && (
                        <img src={contentData[field]} alt={field} className="w-full max-h-40 object-cover object-center" />
                      )}
                      <div className="flex gap-2">
                        <input value={contentData[field] || ''} onChange={(e) => handleFieldChange(field, e.target.value)} className={`${inputClass} flex-1`} placeholder="https://... or upload below" />
                        <button
                          onClick={() => { setUploadTargetField(field); fileInputRef.current?.click(); }}
                          disabled={uploading}
                          className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 text-xs font-semibold hover:border-[#0a0a0a] transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          <Upload size={12} /> {uploading && uploadTargetField === field ? 'Uploading…' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  ) : field === 'body' ? (
                    <textarea
                      value={contentData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={5}
                    />
                  ) : (
                    <input value={contentData[field] || ''} onChange={(e) => handleFieldChange(field, e.target.value)} className={inputClass} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
    </AdminLayout>
  );
}
