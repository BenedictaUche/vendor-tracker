'use client';
import { useEffect, useState } from 'react';
import { createVendor, getVendors, deleteVendor, updateVendor } from '@/lib/api';
import { Vendor } from '@/types/vendor';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


function Home({ signOut, user }: { signOut?: () => void; user?: any }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState({ name: '', category: '', contactEmail: '' });
  const [loading, setLoading] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  const loadVendors = async () => {
    const data = await getVendors();
    setVendors(data);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const resetForm = () => {
    setForm({ name: '', category: '', contactEmail: '' });
    setEditingVendorId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingVendorId) {
        // UPDATE
        await updateVendor({
          vendorId: editingVendorId,
          ...form,
        });
        alert('Vendor updated!');
      } else {
        // CREATE
        await createVendor(form);
        alert('Vendor added!');
      }

      await loadVendors();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving vendor');
    } finally {
      setLoading(false);
    }
  };

  const deleteVendorById = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      await deleteVendor(vendorId);
      await loadVendors();
      alert('Vendor deleted!');
    } catch (err) {
      console.error(err);
      alert('Error deleting vendor');
    }
  };

  const startEditing = (vendor: Vendor) => {
    setForm({
      name: vendor.name,
      category: vendor.category || '',
      contactEmail: vendor.contactEmail || '',
    });
    setEditingVendorId(vendor.vendorId || null);
  };


  return (
    <>

      <header className="flex justify-between items-center mb-8 bg-gray-100 p-4 rounded">
        <div>
          <h1 className="text-xl font-bold text-black">Vendor Tracker</h1>
          <p className="text-sm text-gray-600">Logged in as: {user?.signInDetails?.loginId}</p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </header>

      <main className="p-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

        <section>
          <h2 className="text-xl font-bold mb-4">
            {editingVendorId ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-2 border rounded text-white placeholder:text-gray-400"
              placeholder="Vendor Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              className="w-full p-2 border rounded text-white placeholder:text-gray-400"
              placeholder="Category (e.g. SaaS, Hardware)"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            />

            <input
              className="w-full p-2 border rounded text-white placeholder:text-gray-400"
              placeholder="Email"
              type="email"
              value={form.contactEmail}
              onChange={e => setForm({ ...form, contactEmail: e.target.value })}
            />

            <button
              disabled={loading}
              className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
            >
              {loading
                ? 'Saving...'
                : editingVendorId
                ? 'Update Vendor'
                : 'Add Vendor'}
            </button>

            {editingVendorId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-300 text-black p-2 rounded"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>

        {/* LIST */}
        <section>
          <h2 className="text-xl font-bold mb-4">Current Vendors</h2>
          <div className="space-y-2">
            {vendors.map((v) => (
              <div
                key={v.vendorId}
                className="p-4 border rounded shadow-sm bg-white text-black"
              >
                <p className="font-bold">{v.name}</p>
                <p className="text-sm text-gray-600">
                  {v.category} • {v.contactEmail}
                </p>

                <button
                  className="text-red-500 text-sm"
                  onClick={() => v.vendorId && deleteVendorById(v.vendorId)}
                >
                  Delete
                </button>

                <button
                  className="text-blue-500 text-sm ml-4"
                  onClick={() => startEditing(v)}
                >
                  Edit
                </button>
              </div>
            ))}

            {vendors.length === 0 && (
              <p className="text-gray-400">No vendors found.</p>
            )}
          </div>
        </section>

      </main>
    </>
  );
}

export default withAuthenticator(Home);
