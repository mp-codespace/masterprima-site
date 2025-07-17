// src\app\auth-mp-secure-2024\dashboard\pricing\page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, Loader, CheckCircle, AlertCircle, Award, Star, Crown } from 'lucide-react';

type Category = {
  category_id: string;
  key: string;
  title: string;
  subtitle: string;
};

type FormType = {
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  billing_period: string;
  features: string[];
  category_id: string;
  popular: boolean;
  icon: string;
  is_active: boolean;
};

type Plan = {
  plan_id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  billing_period: string | null;
  features: string[] | null;
  category_id: string;
  popular: boolean;
  icon: string;
  is_active: boolean | null;
};

const iconOptions = [
  { value: 'award', label: 'Award', icon: <Award className="w-5 h-5 inline" /> },
  { value: 'star', label: 'Star', icon: <Star className="w-5 h-5 inline" /> },
  { value: 'crown', label: 'Crown', icon: <Crown className="w-5 h-5 inline" /> },
];

const emptyForm: FormType = {
  name: '',
  description: '',
  price: 0,
  original_price: null,
  billing_period: '',
  features: [],
  category_id: '',
  popular: false,
  icon: 'award',
  is_active: true,
};

export default function PricingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/public/pricing-categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth-mp-secure-2024/pricing');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch pricing plans');
      setPlans(data);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('An error occurred');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchPlans();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({
        ...f,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'features') {
      setForm((f) => ({
        ...f,
        features: value.split('\n').map((v) => v.trim()).filter(Boolean),
      }));
    } else if (name === 'price' || name === 'original_price') {
      setForm((f) => ({
        ...f,
        [name]: value === '' ? null : parseInt(value) || 0,
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      original_price: plan.original_price ?? null,
      billing_period: plan.billing_period || '',
      features: plan.features || [],
      category_id: plan.category_id || (categories[0]?.category_id ?? ''),
      popular: !!plan.popular,
      icon: plan.icon || 'award',
      is_active: !!plan.is_active,
    });
  };

  const handleDelete = async (plan: Plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/auth-mp-secure-2024/pricing/${plan.plan_id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Plan deleted!');
        fetchPlans();
      } else {
        setError('Failed to delete.');
      }
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('An error occurred');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      features: Array.isArray(form.features) ? form.features : [],
      price: form.price || 0,
      original_price: form.original_price,
    };
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/auth-mp-secure-2024/pricing/${editing.plan_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/auth-mp-secure-2024/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (res.ok) {
        setSuccess(editing ? 'Updated!' : 'Created!');
        setEditing(null);
        setForm(emptyForm);
        fetchPlans();
      } else {
        setError(data.error || 'Failed to save.');
      }
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('An error occurred');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Price...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manage Pricing Plans</h1>
      <p className="mb-6 text-gray-600">Configure your application pricing tiers here.</p>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded flex gap-2 items-center mb-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-800 p-2 rounded flex gap-2 items-center mb-3">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Plan Form */}
      <form className="bg-white p-5 rounded-xl border border-gray-200 mb-8" onSubmit={handleSubmit}>
        <h2 className="font-semibold mb-4">{editing ? 'Edit Plan' : 'Add Plan'}</h2>
        <div className="flex flex-wrap gap-4">
          <input
            name="name"
            className="border p-2 rounded w-60"
            placeholder="Plan name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="price"
            type="number"
            className="border p-2 rounded w-40"
            placeholder="Price"
            value={form.price || ''}
            onChange={handleChange}
            required
          />
          <input
            name="original_price"
            type="number"
            className="border p-2 rounded w-40"
            placeholder="Original Price (optional)"
            value={form.original_price ?? ''}
            onChange={handleChange}
          />
          <input
            name="billing_period"
            className="border p-2 rounded w-40"
            placeholder="Billing Period"
            value={form.billing_period || ''}
            onChange={handleChange}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={!!form.is_active}
              onChange={handleChange}
            />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="popular"
              checked={!!form.popular}
              onChange={handleChange}
            />
            Paling Populer
          </label>
          <select
            name="category_id"
            className="border p-2 rounded w-48"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Kategori</option>
            {categories.map(cat =>
              <option key={cat.category_id} value={cat.category_id}>
                {cat.title}
              </option>
            )}
          </select>
          <select
            name="icon"
            className="border p-2 rounded w-40"
            value={form.icon}
            onChange={handleChange}
          >
            {iconOptions.map(opt =>
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>
        </div>
        <textarea
          name="description"
          className="border p-2 rounded w-full mt-3"
          placeholder="Description"
          value={form.description || ''}
          onChange={handleChange}
          rows={2}
        />
        <textarea
          name="features"
          className="border p-2 rounded w-full mt-3"
          placeholder="Features (one per line)"
          value={form.features?.join('\n') || ''}
          onChange={handleChange}
          rows={3}
        />
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : editing ? (
              'Save Changes'
            ) : (
              'Add Plan'
            )}
          </button>
          {editing && (
            <button
              type="button"
              className="bg-gray-200 px-4 py-2 rounded"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Plan List */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {categories.length === 0 ? (
          <div className="text-center text-gray-400">No categories available.</div>
        ) : (
          categories.map(category => (
            <div key={category.category_id} className="mb-8">
              <h3 className="text-lg font-bold mb-3">{category.title}</h3>
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th>Price</th>
                    <th>Original</th>
                    <th>Period</th>
                    <th>Popular</th>
                    <th>Active</th>
                    <th>Features</th>
                    <th>Icon</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {plans.filter(p => p.category_id === category.category_id).length === 0 ? (
                    <tr><td colSpan={9} className="text-gray-400 text-center py-2">No plans.</td></tr>
                  ) : (
                    plans.filter(p => p.category_id === category.category_id).map(plan => (
                      <tr key={plan.plan_id} className="border-t">
                        <td className="py-2">{plan.name}</td>
                        <td>Rp {plan.price.toLocaleString('id-ID')}</td>
                        <td>{plan.original_price ? `Rp ${plan.original_price.toLocaleString('id-ID')}` : '-'}</td>
                        <td>{plan.billing_period || '-'}</td>
                        <td>{plan.popular ? '🔥' : ''}</td>
                        <td>{plan.is_active ? '✅' : '❌'}</td>
                        <td>
                          <ul className="list-disc list-inside text-sm">
                            {(plan.features || []).map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </td>
                        <td>
                          {plan.icon === 'award' ? <Award className="w-4 h-4" /> :
                            plan.icon === 'star' ? <Star className="w-4 h-4" /> :
                              plan.icon === 'crown' ? <Crown className="w-4 h-4" /> : plan.icon}
                        </td>
                        <td>
                          <button className="p-1" title="Edit" onClick={() => handleEdit(plan)}><Edit className="w-4 h-4 text-blue-500" /></button>
                          <button className="p-1" title="Delete" onClick={() => handleDelete(plan)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
