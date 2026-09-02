import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminSettings, useUpdateAdminSetting } from '@/hooks/useAdminData';
import { toast } from 'sonner';

const SETTING_GROUPS = [
  {
    title: 'Payment Providers',
    settings: [
      { key: 'paystack_enabled', label: 'Enable Paystack', type: 'toggle', description: 'Accept payments via Paystack' },
      { key: 'flutterwave_enabled', label: 'Enable Flutterwave', type: 'toggle', description: 'Accept payments via Flutterwave' },
    ],
  },
  {
    title: 'Payment Credentials (Server-Side — Kept Secure)',
    settings: [
      { key: 'paystack_secret_key', label: 'Paystack Secret Key', type: 'secret', description: 'Used for server-side verification (sk_live_...)' },
      { key: 'flutterwave_secret_key', label: 'Flutterwave Secret Key', type: 'secret', description: 'Used for transaction verification' },
    ],
  },
  {
    title: 'CJ Dropshipping',
    settings: [
      { key: 'cj_api_key', label: 'CJ API Key', type: 'secret', description: 'Your CJ Dropshipping API key' },
      { key: 'cj_api_secret', label: 'CJ API Secret', type: 'secret', description: 'Your CJ Dropshipping API secret' },
    ],
  },
  {
    title: 'Email',
    settings: [
      { key: 'resend_api_key', label: 'Resend API Key', type: 'secret', description: 'For transactional email notifications (re_...)' },
      { key: 'store_email', label: 'Store Email', type: 'text', description: 'From address for customer emails' },
    ],
  },
  {
    title: 'Store',
    settings: [
      { key: 'free_shipping_threshold', label: 'Free Shipping Threshold ($)', type: 'text', description: 'Minimum order amount for free shipping' },
      { key: 'announcement_text', label: 'Announcement Bar Text', type: 'text', description: 'Scrolling text in the announcement bar' },
    ],
  },
];

export default function AdminSettings() {
  const { data: settings } = useAdminSettings();
  const { mutateAsync: updateSetting } = useUpdateAdminSetting();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState('');

  const getValue = (key: string) => localValues[key] !== undefined ? localValues[key] : (settings?.[key] || '');

  const handleSave = async (key: string) => {
    setSaving(key);
    await updateSetting({ key, value: getValue(key) });
    setSaving('');
  };

  const handleSaveAll = async () => {
    for (const [key, value] of Object.entries(localValues)) {
      await updateSetting({ key, value });
    }
    setLocalValues({});
    toast.success('All settings saved');
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-3xl">
        {SETTING_GROUPS.map((group) => (
          <div key={group.title} className="bg-white border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-sm">{group.title}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {group.settings.map((setting) => {
                const value = getValue(setting.key);
                const isSecret = setting.type === 'secret';
                const isVisible = showSecrets[setting.key];
                const isToggle = setting.type === 'toggle';

                return (
                  <div key={setting.key} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-medium text-[#0a0a0a]">{setting.label}</label>
                      <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isToggle ? (
                        <button
                          onClick={async () => {
                            const newVal = value === 'false' ? 'true' : 'false';
                            setLocalValues({ ...localValues, [setting.key]: newVal });
                            await updateSetting({ key: setting.key, value: newVal });
                          }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${value !== 'false' ? 'bg-[#C9A96E]' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value !== 'false' ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} style={{ transform: value !== 'false' ? 'translateX(20px)' : 'translateX(0)' }} />
                        </button>
                      ) : (
                        <>
                          <div className="relative">
                            <input
                              type={isSecret && !isVisible ? 'password' : 'text'}
                              value={value}
                              onChange={(e) => setLocalValues({ ...localValues, [setting.key]: e.target.value })}
                              className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] w-64"
                              placeholder={isSecret ? '••••••••••••••' : setting.label}
                            />
                            {isSecret && (
                              <button
                                onClick={() => setShowSecrets({ ...showSecrets, [setting.key]: !isVisible })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              >
                                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => handleSave(setting.key)}
                            disabled={saving === setting.key}
                            className="flex items-center gap-1 bg-[#0a0a0a] text-white px-3 py-2 text-xs font-semibold hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors disabled:opacity-50"
                          >
                            <Save size={12} />
                            {saving === setting.key ? '…' : 'Save'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Environment variable reminder */}
        <div className="bg-[#F5F0E8] border border-[#C9A96E]/30 p-5">
          <h3 className="font-semibold text-sm mb-2">Frontend Environment Variables</h3>
          <p className="text-xs text-gray-600 mb-3">These must be set as environment variables in Vercel (not stored here):</p>
          <div className="space-y-1.5 font-mono text-xs text-gray-700">
            <p>VITE_PAYSTACK_PUBLIC_KEY=pk_live_...</p>
            <p>VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...</p>
            <p>VITE_SUPABASE_URL=https://....supabase.co</p>
            <p>VITE_SUPABASE_ANON_KEY=eyJ...</p>
          </div>
        </div>

        {/* Vercel deployment */}
        <div className="bg-white border border-gray-100 p-5">
          <h3 className="font-semibold text-sm mb-2">Vercel Deployment</h3>
          <p className="text-xs text-gray-600 mb-3">For Apple Pay domain verification, place the Paystack-provided verification file at:</p>
          <code className="text-xs bg-gray-100 px-3 py-1.5 block font-mono">public/.well-known/[verification-file-name]</code>
          <p className="text-xs text-gray-400 mt-2">The /.well-known/ path is already configured in vercel.json to serve static files correctly.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
