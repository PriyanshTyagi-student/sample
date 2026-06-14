'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { PermissionGate } from '@/components/PermissionGate';

export default function SettingsPage() {
  const [tab, setTab] = useState<'config' | 'features' | 'email' | 'danger'>('config');
  const [settings, setSettings] = useState({
    siteName: 'TechMNHub',
    maxLoginAttempts: 5,
    sessionTimeout: 3600,
    emailNotifications: true,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const handleDangerAction = (action: string) => {
    if (confirm(`Are you sure you want to ${action}? This action cannot be undone.`)) {
      console.log(`Executing: ${action}`);
      alert(`${action} completed!`);
    }
  };

  return (
    <PermissionGate permissions={['settings.manage']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
          <p className="text-slate-400 mt-2">Manage system configuration and settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'config', label: 'System Config' },
            { id: 'features', label: 'Feature Flags' },
            { id: 'email', label: 'Email Settings' },
            { id: 'danger', label: 'Danger Zone' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-lg backdrop-blur-xl font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-white/20 border border-white/30 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* System Config Tab */}
        {tab === 'config' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Site Name</label>
                  <GlassInput
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Max Login Attempts</label>
                  <GlassInput
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Session Timeout (seconds)</label>
                  <GlassInput
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <GlassButton onClick={handleSave}>Save Changes</GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Feature Flags Tab */}
        {tab === 'features' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="space-y-4">
                {[
                  { name: 'Email Notifications', id: 'emailNotifications' },
                  { name: 'Two-Factor Authentication', id: 'twoFactor' },
                  { name: 'Advanced Analytics', id: 'advancedAnalytics' },
                  { name: 'API Access', id: 'apiAccess' },
                ].map((flag) => (
                  <label key={flag.id} className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <input
                      type="checkbox"
                      defaultChecked={flag.id === 'emailNotifications'}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-slate-200 font-medium">{flag.name}</span>
                  </label>
                ))}
                <div className="flex gap-2 justify-end pt-4">
                  <GlassButton onClick={handleSave}>Save Features</GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Email Settings Tab */}
        {tab === 'email' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">SMTP Server</label>
                  <GlassInput placeholder="smtp.example.com" />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">SMTP Port</label>
                  <GlassInput type="number" placeholder="587" />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">From Email</label>
                  <GlassInput type="email" placeholder="noreply@example.com" />
                </div>
                <div className="flex gap-2 justify-end">
                  <GlassButton onClick={handleSave}>Save Email Settings</GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Danger Zone Tab */}
        {tab === 'danger' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="border-red-500/20 bg-red-500/5">
              <div className="space-y-4">
                <h3 className="text-red-400 font-semibold text-lg">Danger Zone</h3>
                <p className="text-slate-400 text-sm">These actions cannot be undone. Use with extreme caution.</p>
                
                <div className="space-y-2">
                  <GlassButton
                    variant="danger"
                    onClick={() => handleDangerAction('Clear Cache')}
                    className="w-full justify-start"
                  >
                    Clear All Cache
                  </GlassButton>
                  <p className="text-slate-400 text-xs ml-4">Remove all cached data from memory</p>
                </div>

                <div className="space-y-2">
                  <GlassButton
                    variant="danger"
                    onClick={() => handleDangerAction('Reset Database')}
                    className="w-full justify-start"
                  >
                    Reset Database
                  </GlassButton>
                  <p className="text-slate-400 text-xs ml-4">Warning: This will delete all data. Do not use unless absolutely necessary.</p>
                </div>

                <div className="space-y-2">
                  <GlassButton
                    variant="danger"
                    onClick={() => handleDangerAction('Export All Data')}
                    className="w-full justify-start"
                  >
                    Export All Data
                  </GlassButton>
                  <p className="text-slate-400 text-xs ml-4">Download a complete backup of all system data</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PermissionGate>
  );
}
