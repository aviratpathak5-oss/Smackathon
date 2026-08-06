import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ExpertCard from '../components/ExpertCard';
import CallbackForm from '../components/CallbackForm';
import { INITIAL_EXPERTS, fetchCollectionWithFallback } from '../lib/seedDatabase';

export function ServiceContact() {
  const { t } = useTranslation();
  const [experts, setExperts] = useState(INITIAL_EXPERTS);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperts() {
      const list = await fetchCollectionWithFallback('experts', INITIAL_EXPERTS);
      setExperts(list);
      setLoading(false);
    }
    loadExperts();
  }, []);

  const handleOpenCallback = (expert) => {
    setSelectedExpert(expert);
    setShowCallbackModal(true);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-secondary-container/60 text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Agricultural Scientist & Extension Advisory
          </div>
          <h1 className="font-headline-md text-3xl md:text-5xl font-bold text-primary">
            {t('pages.serviceContact.title')}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            {t('pages.serviceContact.subtitle')}
          </p>
        </div>

        {/* 24/7 Helpline Banner */}
        <div className="bg-primary-container text-on-primary border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-terracotta text-white flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[36px]">headset_mic</span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-tertiary-fixed-dim">
                Toll-Free Kisan Call Center
              </span>
              <h2 className="font-headline-sm text-2xl md:text-3xl font-extrabold">
                1800-AGRO-KALYAN (1800-247-6525)
              </h2>
              <p className="text-xs md:text-sm text-surface-container-high">
                Speak directly with agronomists in Hindi, Tamil, Punjabi, Marathi & English (6 AM - 10 PM)
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenCallback(null)}
            className="w-full md:w-auto px-8 py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">phone_callback</span>
            <span>Request Free Callback</span>
          </button>
        </div>

        {/* Agricultural Experts Grid Section */}
        <div className="space-y-6">
          <div className="border-b border-outline-variant/20 pb-4">
            <h2 className="font-headline-sm text-2xl md:text-3xl font-bold text-primary">
              Connect With Specialized Agricultural Scientists
            </h2>
            <p className="text-sm text-on-surface-variant">Verified university researchers and plant pathology experts</p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-secondary font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
              <span>Loading agricultural experts directory...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experts.map((exp) => (
                <ExpertCard
                  key={exp.id}
                  expert={exp}
                  onRequestCallback={handleOpenCallback}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCallbackModal && (
        <CallbackForm
          selectedExpert={selectedExpert}
          onClose={() => setShowCallbackModal(false)}
        />
      )}
    </div>
  );
}

export default ServiceContact;
