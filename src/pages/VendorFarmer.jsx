import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductListingCard from '../components/ProductListingCard';
import { INITIAL_LISTINGS, fetchCollectionWithFallback } from '../lib/seedDatabase';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function VendorFarmer() {
  const { t } = useTranslation();
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedListerFilter, setSelectedListerFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // New Listing Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [listerType, setListerType] = useState('Farmer');
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [category, setCategory] = useState('Grains & Pulses');
  const [photo, setPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadListings() {
      const list = await fetchCollectionWithFallback('listings', INITIAL_LISTINGS);
      setListings(list);
      setLoading(false);
    }
    loadListings();
  }, []);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!farmerName || !listerType || !cropType || !quantity || !pricePerUnit || !location || !contactInfo) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    const photoUrlValue = photo.trim() || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';
    const newListingData = {
      farmerName,
      listerType,
      cropType,
      quantity,
      pricePerUnit,
      location,
      contactInfo,
      category,
      photoUrl: photoUrlValue,
      photo: photoUrlValue,
      datePosted: new Date().toISOString().split('T')[0]
    };

    try {
      const docRef = await addDoc(collection(db, 'listings'), newListingData);
      const createdItem = { id: docRef.id, ...newListingData };
      setListings((prev) => [createdItem, ...prev]);
    } catch (err) {
      console.warn('Firestore write warning (adding to local state):', err);
      const createdItem = { id: 'list_' + Date.now(), ...newListingData };
      setListings((prev) => [createdItem, ...prev]);
    } finally {
      setSubmitting(false);
      setShowAddModal(false);
      setFarmerName('');
      setListerType('Farmer');
      setCropType('');
      setQuantity('');
      setPricePerUnit('');
      setLocation('');
      setContactInfo('');
      setPhoto('');
    }
  };

  const categories = ['All', 'Grains & Pulses', 'Vegetables', 'Farm Machinery', 'Fertilizers & Seeds'];

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesListerType =
      selectedListerFilter === 'All' ||
      (selectedListerFilter === 'Farmers' && (item.listerType || 'Farmer') === 'Farmer') ||
      (selectedListerFilter === 'Vendors' && item.listerType === 'Vendor');

    return matchesSearch && matchesCategory && matchesListerType;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-8">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Direct Farmer-to-Vendor Trade Platform
          </div>
          <h1 className="font-headline-md text-3xl md:text-5xl font-bold text-primary">
            {t('pages.vendorFarmer.title')}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            {t('pages.vendorFarmer.desc')}
          </p>
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:flex-1">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-[22px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crops, machinery, or city location..."
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface"
              />
            </div>

            {/* Create Listing Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Post Crop / Equipment Listing</span>
            </button>
          </div>

          {/* Lister Type & Category Filter Chips */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
            {/* Lister Type Toggle Buttons */}
            <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/30">
              {['All', 'Farmers', 'Vendors'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedListerFilter(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedListerFilter === type
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {type === 'Farmers' ? '👨‍🌾 Farmers' : type === 'Vendors' ? '🏪 Vendors' : 'All'}
                </button>
              ))}
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                    selectedCategory === cat
                      ? 'bg-primary-container text-on-primary border-primary'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/40 hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-16 text-center text-secondary font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
            <span>Fetching live marketplace listings...</span>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
            <h3 className="font-headline-sm text-xl font-bold text-primary">No Active Listings Found</h3>
            <p className="text-sm text-on-surface-variant">Be the first farmer or vendor to post a produce or machinery listing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <ProductListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>

      {/* Add New Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-xl relative text-on-surface my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[28px]">add_shopping_cart</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-2xl font-bold text-primary">Create Farmer / Vendor Listing</h3>
                <p className="text-xs text-on-surface-variant">Sell crops or list machinery rentals directly</p>
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-on-surface">Farmer / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gurpreet Singh"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-on-surface">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-semibold"
                  >
                    <option value="Grains & Pulses">Grains & Pulses</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Farm Machinery">Farm Machinery</option>
                    <option value="Fertilizers & Seeds">Fertilizers & Seeds</option>
                  </select>
                </div>
              </div>

              {/* Lister Type Field */}
              <div>
                <label className="block font-semibold mb-1.5 text-on-surface">Lister Type *</label>
                <div className="flex items-center gap-6 py-1 bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs sm:text-sm text-on-surface">
                    <input
                      type="radio"
                      name="listerType"
                      value="Farmer"
                      checked={listerType === 'Farmer'}
                      onChange={(e) => setListerType(e.target.value)}
                      required
                      className="w-4 h-4 text-terracotta focus:ring-terracotta"
                    />
                    <span>👨‍🌾 Farmer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs sm:text-sm text-on-surface">
                    <input
                      type="radio"
                      name="listerType"
                      value="Vendor"
                      checked={listerType === 'Vendor'}
                      onChange={(e) => setListerType(e.target.value)}
                      required
                      className="w-4 h-4 text-terracotta focus:ring-terracotta"
                    />
                    <span>🏪 Vendor</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-on-surface">Crop / Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharbati Wheat (Grade A) / Rotavator 7ft"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-on-surface">Quantity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 Quintals / 2 Units"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-on-surface">Price per Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹2,450 / Quintal"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-on-surface">Location (District, State) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnal, Haryana"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-on-surface">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-on-surface">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none text-xs"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">publish</span>
                  <span>{submitting ? 'Publishing Listing...' : 'Publish Listing Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorFarmer;
