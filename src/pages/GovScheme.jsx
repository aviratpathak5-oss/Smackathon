import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SchemeCard from '../components/SchemeCard';
import { INITIAL_SCHEMES, fetchCollectionWithFallback } from '../lib/seedDatabase';

export function GovScheme() {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchemes() {
      const list = await fetchCollectionWithFallback('schemes', INITIAL_SCHEMES);
      setSchemes(list);
      setLoading(false);
    }
    loadSchemes();
  }, []);

  const categories = ['All', 'Financial Assistance', 'Crop Insurance', 'Soil & Fertilizer Advisory', 'Credit & Loans', 'Solar Equipment & Subsidy', 'Machinery Subsidy', 'Direct Trade Platform'];
  const levels = ['All', 'Central Government', 'Central / State Shared'];

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.eligibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.benefits.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || scheme.level.includes(selectedLevel);

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-secondary-container/60 text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Official Government Subsidies Portal
          </div>
          <h1 className="font-headline-md text-3xl md:text-5xl font-bold text-primary">
            {t('pages.govSchemes.title')}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            {t('pages.govSchemes.subtitle')}
          </p>
        </div>

        {/* Filter & Search Controls */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-[22px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, eligibility, or benefits..."
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface"
              />
            </div>

            {/* Level Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-on-surface font-semibold"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl === 'All' ? 'All Government Levels' : lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
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

        {/* Schemes Grid */}
        {loading ? (
          <div className="py-16 text-center text-secondary font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
            <span>Fetching verified government schemes...</span>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
            <h3 className="font-headline-sm text-xl font-bold text-primary">No Matching Schemes Found</h3>
            <p className="text-sm text-on-surface-variant">Try adjusting your category filter or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GovScheme;
