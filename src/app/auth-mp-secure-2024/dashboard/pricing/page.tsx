// src\app\auth-mp-secure-2024\dashboard\pricing\page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, Loader, CheckCircle, AlertCircle, Award, Star, Crown, Plus, X } from 'lucide-react';

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
  { value: 'award', label: 'Award', icon: <Award className="w-5 h-5" /> },
  { value: 'star', label: 'Star', icon: <Star className="w-5 h-5" /> },
  { value: 'crown', label: 'Crown', icon: <Crown className="w-5 h-5" /> },
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
        setSuccess('Plan deleted successfully!');
        fetchPlans();
      } else {
        setError('Failed to delete plan.');
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
        setSuccess(editing ? 'Plan updated successfully!' : 'Plan created successfully!');
        setEditing(null);
        setForm(emptyForm);
        fetchPlans();
      } else {
        setError(data.error || 'Failed to save plan.');
      }
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('An error occurred');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'award': return <Award className="w-4 h-4" />;
      case 'star': return <Star className="w-4 h-4" />;
      case 'crown': return <Crown className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pricing Plans Management</h1>
              <p className="mt-1 text-gray-500">Configure your application pricing tiers and packages.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Plan Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? 'Edit Plan' : 'Add New Plan'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Plan Name */}
              <div className="lg:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter plan name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Rp) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  value={form.price || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Original Price */}
              <div>
                <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (Rp)
                </label>
                <input
                  id="original_price"
                  name="original_price"
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                  value={form.original_price ?? ''}
                  onChange={handleChange}
                />
              </div>

              {/* Billing Period */}
              <div>
                <label htmlFor="billing_period" className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period
                </label>
                <input
                  id="billing_period"
                  name="billing_period"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., per month, per year"
                  value={form.billing_period}
                  onChange={handleChange}
                />
              </div>

              {/* Icon */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  id="icon"
                  name="icon"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.icon}
                  onChange={handleChange}
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="lg:col-span-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Brief description of this plan"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Features */}
              <div className="lg:col-span-3">
                <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-2">
                  Features (one per line)
                </label>
                <textarea
                  id="features"
                  name="features"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Enter each feature on a new line"
                  value={form.features?.join('\n') || ''}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Checkboxes */}
              <div className="lg:col-span-3 flex flex-wrap gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Plan</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={form.popular}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Most Popular</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-4 h-4 mr-2 inline animate-spin" />
                ) : editing ? (
                  'Update Plan'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Add Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Plans List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Existing Plans</h2>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">No categories available</div>
              <p className="text-sm text-gray-500">Create categories first to add pricing plans.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {categories.map(category => {
                const categoryPlans = plans.filter(p => p.category_id === category.category_id);
                
                return (
                  <div key={category.category_id} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.title}</h3>
                    
                    {categoryPlans.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No plans in this category yet.
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="pb-3">Plan</th>
                                <th className="pb-3">Price</th>
                                <th className="pb-3">Original</th>
                                <th className="pb-3">Period</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Features</th>
                                <th className="pb-3">Icon</th>
                                <th className="pb-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {categoryPlans.map(plan => (
                                <tr key={plan.plan_id}>
                                  <td className="py-4">
                                    <div>
                                      <div className="font-medium text-gray-900">{plan.name}</div>
                                      {plan.description && (
                                        <div className="text-sm text-gray-500">{plan.description}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 text-sm">
                                    Rp {plan.price.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-4 text-sm">
                                    {plan.original_price ? `Rp ${plan.original_price.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-4 text-sm">
                                    {plan.billing_period || '-'}
                                  </td>
                                  <td className="py-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                      </span>
                                      {plan.popular && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                          Popular
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 text-sm">
                                    <div className="max-w-xs">
                                      {(plan.features || []).length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                          {plan.features?.slice(0, 3).map((feature, i) => (
                                            <li key={i} className="text-gray-600">{feature}</li>
                                          ))}
                                          {plan.features && plan.features.length > 3 && (
                                            <li className="text-gray-400">+{plan.features.length - 3} more</li>
                                          )}
                                        </ul>
                                      ) : (
                                        <span className="text-gray-400">No features</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    {getIconComponent(plan.icon)}
                                  </td>
                                  <td className="py-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEdit(plan)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Edit plan"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(plan)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Delete plan"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                          {categoryPlans.map(plan => (
                            <div key={plan.plan_id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{plan.name}</h4>
                                  {plan.description && (
                                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleEdit(plan)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(plan)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-gray-500">Price:</span>
                                  <div className="font-medium">Rp {plan.price.toLocaleString('id-ID')}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Original:</span>
                                  <div className="font-medium">
                                    {plan.original_price ? `Rp ${plan.original_price.toLocaleString('id-ID')}` : '-'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Period:</span>
                                  <div className="font-medium">{plan.billing_period || '-'}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Icon:</span>
                                  <div className="font-medium">{getIconComponent(plan.icon)}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {plan.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {plan.popular && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Popular
                                  </span>
                                )}
                              </div>

                              {(plan.features || []).length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm">Features:</span>
                                  <ul className="list-disc list-inside space-y-1 mt-1">
                                    {plan.features?.map((feature, i) => (
                                      <li key={i} className="text-sm text-gray-600">{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}