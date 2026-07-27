'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, Save, Lock, Bell, Moon, ArrowLeft, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface UserSettings {
  display_name: string
  default_currency: string
  dark_mode: boolean
  email_notifications: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<UserSettings>({
    display_name: '',
    default_currency: 'PKR',
    dark_mode: false,
    email_notifications: true,
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings({
          display_name: data.display_name || '',
          default_currency: data.default_currency || 'PKR',
          dark_mode: data.dark_mode || false,
          email_notifications: data.email_notifications ?? true,
        })
        // Apply dark mode from DB
        if (data.dark_mode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) toast.error('Failed to save settings')
    else {
      toast.success('Settings saved!')
      // Apply dark mode preference immediately
      if (settings.dark_mode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure? This will permanently delete your account and all saved deals. This cannot be undone.')
    if (!confirmed) return
    toast.error('Account deletion requires a server action. Please contact support.')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6F4E37]/30 border-t-[#6F4E37] rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)]">
      {/* Header */}
      <div className="border-b border-[var(--border-light)] bg-[var(--card-bg)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to ShopLens</span>
          </Link>
          <div className="w-px h-5 bg-[var(--border-light)]" />
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#6F4E37]" />
            <h1 className="font-bold text-lg text-[var(--text-main)]">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Account Info */}
        <div className="glass-card bg-white p-6 rounded-2xl border border-[var(--border-light)]">
          <h2 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-[#6F4E37]" /> Account
          </h2>
          <div className="p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-light)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Signed in as</p>
            <p className="font-semibold text-[var(--text-main)]">{user?.email}</p>
          </div>
        </div>

        {/* Preferences */}
        <form onSubmit={handleSaveSettings} className="glass-card bg-white p-6 rounded-2xl border border-[var(--border-light)]">
          <h2 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-[#6F4E37]" /> Preferences
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Display Name</label>
              <input
                type="text"
                value={settings.display_name}
                onChange={e => setSettings(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Your name (optional)"
                className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-3 px-4 text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Default Currency</label>
              <select
                value={settings.default_currency}
                onChange={e => setSettings(prev => ({ ...prev, default_currency: e.target.value }))}
                className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-3 px-4 text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-colors"
              >
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-light)] cursor-pointer hover:border-[var(--primary)] transition-colors">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">Dark Mode</p>
                  <p className="text-xs text-[var(--text-muted)]">Sync dark mode across all devices</p>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${settings.dark_mode ? 'bg-[#6F4E37]' : 'bg-gray-300'}`}
                onClick={() => setSettings(prev => ({ ...prev, dark_mode: !prev.dark_mode }))}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${settings.dark_mode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-light)] cursor-pointer hover:border-[var(--primary)] transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">Email Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive price drop alerts via email</p>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${settings.email_notifications ? 'bg-[#6F4E37]' : 'bg-gray-300'}`}
                onClick={() => setSettings(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${settings.email_notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-6 primary-btn px-6 py-3 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="glass-card bg-white p-6 rounded-2xl border border-[var(--border-light)]">
          <h2 className="font-bold text-lg text-[var(--text-main)] flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-[#6F4E37]" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-3 px-4 text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-[var(--bg-color)] border border-[var(--border-light)] rounded-xl py-3 px-4 text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={changingPassword || !newPassword}
            className="mt-6 primary-btn px-6 py-3 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {changingPassword ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10">
          <h2 className="font-bold text-base text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Once you delete your account, all your saved deals and data will be permanently removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 rounded-xl border border-red-400 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </main>
  )
}
