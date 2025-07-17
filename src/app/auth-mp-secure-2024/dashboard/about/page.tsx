/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src\app\auth-mp-secure-2024\dashboard\about\page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

// Auto-increment ID agar tidak hydration mismatch
let locationIdCounter = 10000;

type Location = {
  id: number;
  name: string;
  address: string;
  phone: string;
  isMain: boolean;
  hours: string;
  facilities: string[];
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  area?: string;
};

type Settings = {
  stats_cpns_graduates: number;
  stats_success_rate: number;
  stats_active_students: number;
  stats_experience_years: number;
  stats_graduation_rate: number;
  vision: string;
  mission: string[];
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  locations: Location[];
  // Jangan masukkan field yg tidak ada di DB
};

const emptyLocation = (): Location => ({
  id: locationIdCounter++,
  name: "",
  address: "",
  phone: "",
  isMain: false,
  hours: "",
  facilities: [],
  mapsUrl: "",
  mapsEmbedUrl: "",
  area: "",
});

export default function AboutSettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth-mp-secure-2024/site-settings');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!Array.isArray(data.mission)) data.mission = data.mission ? [data.mission] : [];
        if (!Array.isArray(data.locations)) data.locations = [];
        setForm(data);

        if (Array.isArray(data.locations) && data.locations.length > 0) {
          const maxId = Math.max(...data.locations.map((l: Location) => typeof l.id === 'number' ? l.id : 0), 0);
          if (maxId >= locationIdCounter) locationIdCounter = maxId + 1;
        }
      } catch (e: any) {
        setError('Failed to load settings');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm(f => ({
      ...f!,
      [name]: name.startsWith('stats_') ? Number(value) : value,
    }));
  };

  const handleMissionChange = (value: string) => {
    setForm(f => ({ ...f!, mission: value.split('\n') }));
  };

  // Location management
  const handleLocationChange = (idx: number, field: keyof Location, value: any) => {
    if (!form) return;
    const locations = form.locations.map((loc, i) => {
      if (i === idx) {
        if (field === 'facilities') {
          return { ...loc, facilities: value.split(',').map((v: string) => v.trim()).filter(Boolean) };
        }
        if (field === 'isMain') {
          return { ...loc, isMain: value };
        }
        return { ...loc, [field]: value };
      }
      if (field === 'isMain' && value) return { ...loc, isMain: false };
      return loc;
    });
    setForm(f => ({ ...f!, locations }));
  };

  const addLocation = () => {
    if (!form) return;
    setForm(f => ({ ...f!, locations: [...f!.locations, emptyLocation()] }));
  };

  const deleteLocation = (idx: number) => {
    if (!form) return;
    const newLocs = form.locations.filter((_, i) => i !== idx);
    if (!newLocs.some(loc => loc.isMain) && newLocs.length > 0) newLocs[0].isMain = true;
    setForm(f => ({ ...f!, locations: newLocs }));
    setDeleteIdx(null);
  };

  const setAsMain = (idx: number) => {
    if (!form) return;
    const newLocs = form.locations.map((loc, i) => ({ ...loc, isMain: i === idx }));
    setForm(f => ({ ...f!, locations: newLocs }));
  };

  // FIX: Hanya kirim field yang cocok ke DB!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (!form) throw new Error('Form not ready');
      const payload: any = {
        id: 'main', // Primary key di DB
        stats_cpns_graduates: form.stats_cpns_graduates,
        stats_success_rate: form.stats_success_rate,
        stats_active_students: form.stats_active_students,
        stats_experience_years: form.stats_experience_years,
        stats_graduation_rate: form.stats_graduation_rate,
        vision: form.vision,
        mission: form.mission,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        contact_whatsapp: form.contact_whatsapp,
        locations: form.locations,
      };
      const res = await fetch('/api/auth-mp-secure-2024/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = 'Failed to save';
        try {
          const err = await res.json();
          if (err && err.error) msg = err.error;
        } catch {}
        throw new Error(msg);
      }
      setSuccess('Settings updated!');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading About...</p>
          </div>
        </div>
      );
    }
  if (!form) return <div className="text-red-500">No data.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manage About & Site Information</h1>
      <p className="mb-6 text-gray-600">Edit all indicators and site info below. All changes apply to public content.</p>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Stats Section */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>CPNS Graduates</label>
              <input type="number" name="stats_cpns_graduates" value={form.stats_cpns_graduates} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label>Success Rate (%)</label>
              <input type="number" name="stats_success_rate" value={form.stats_success_rate} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label>Active Students</label>
              <input type="number" name="stats_active_students" value={form.stats_active_students} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label>Years of Experience</label>
              <input type="number" name="stats_experience_years" value={form.stats_experience_years} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label>Graduation Rate (%)</label>
              <input type="number" name="stats_graduation_rate" value={form.stats_graduation_rate} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Vision & Mission</h2>
          <div>
            <label>Vision</label>
            <textarea name="vision" value={form.vision} onChange={handleChange} rows={2} className="w-full border-gray-300 rounded-md"></textarea>
          </div>
          <div className="mt-4">
            <label>Mission (one per line)</label>
            <textarea name="mission" value={form.mission.join('\n')} onChange={e => handleMissionChange(e.target.value)} rows={4} className="w-full border-gray-300 rounded-md"></textarea>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>Email</label>
              <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label>Phone</label>
              <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label>WhatsApp Number (628xx...)</label>
              <input type="tel" name="contact_whatsapp" value={form.contact_whatsapp} onChange={handleChange} className="w-full border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Locations</h2>
            <button type="button" onClick={addLocation} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
              <Plus className="w-4 h-4" /> Add Location
            </button>
          </div>
          <div className="space-y-6">
            {form.locations.map((loc, idx) => (
              <div key={loc.id} className="p-4 border rounded-lg relative bg-gray-50">
                <button type="button" onClick={() => setDeleteIdx(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Branch Name" value={loc.name} onChange={e => handleLocationChange(idx, 'name', e.target.value)} className="border-gray-300 rounded-md" />
                  <input type="text" placeholder="Address" value={loc.address} onChange={e => handleLocationChange(idx, 'address', e.target.value)} className="border-gray-300 rounded-md" />
                  <input type="text" placeholder="Phone" value={loc.phone} onChange={e => handleLocationChange(idx, 'phone', e.target.value)} className="border-gray-300 rounded-md" />
                  <input type="text" placeholder="Hours" value={loc.hours} onChange={e => handleLocationChange(idx, 'hours', e.target.value)} className="border-gray-300 rounded-md" />
                  <input type="text" placeholder="Google Maps Link (mapsUrl)" value={loc.mapsUrl || ""} onChange={e => handleLocationChange(idx, 'mapsUrl', e.target.value)} className="border-gray-300 rounded-md" />
                  <input type="text" placeholder="Google Maps Embed URL (mapsEmbedUrl)" value={loc.mapsEmbedUrl || ""} onChange={e => handleLocationChange(idx, 'mapsEmbedUrl', e.target.value)} className="border-gray-300 rounded-md" />
                  <input type="text" placeholder="Area (opsional)" value={loc.area || ""} onChange={e => handleLocationChange(idx, 'area', e.target.value)} className="border-gray-300 rounded-md" />
                  <textarea placeholder="Facilities (comma-separated)" value={loc.facilities.join(', ')} onChange={e => handleLocationChange(idx, 'facilities', e.target.value)} className="md:col-span-2 border-gray-300 rounded-md" rows={2}></textarea>
                  <label className="flex items-center gap-2 md:col-span-2">
                    <input type="radio" name="isMainLocation" checked={loc.isMain} onChange={() => setAsMain(idx)} />
                    Set as Main Branch
                  </label>
                </div>
                {deleteIdx === idx && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 rounded-lg border border-red-500">
                    <p className="text-red-700 mb-4">Delete this location?</p>
                    <div className="flex gap-2">
                      <button type="button" className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => deleteLocation(idx)}>Yes, delete</button>
                      <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setDeleteIdx(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-orange-600 text-white px-6 py-3 rounded-md font-semibold flex items-center gap-2 disabled:bg-gray-400">
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded-md flex gap-2 items-center mb-4"><AlertCircle className="w-5 h-5" />{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-3 rounded-md flex gap-2 items-center mb-4"><CheckCircle className="w-5 h-5" />{success}</div>}
      </form>
    </div>
  );
}
