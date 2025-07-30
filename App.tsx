
import React, { useState, useCallback } from 'react';
import { Section, BrandData } from './types';
import { SECTIONS } from './constants';
import { CoreIcon, VisualIcon, MessagingIcon, AuditIcon, AcademyIcon, SparklesIcon, GlossaryIcon } from './components/IconComponents';
import BrandCoreSection from './components/BrandCoreSection';
import VisualIdentitySection from './components/VisualIdentitySection';
import MessagingSection from './components/MessagingSection';
import AuditSection from './components/AuditSection';
import AcademySection from './components/AcademySection';
import GlossarySection from './components/GlossarySection';

const App = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Core);
  const [brandData, setBrandData] = useState<BrandData>({
    archetype: '',
    mission: '',
    vision: '',
    values: '',
    voice: '',
  });

  const updateBrandData = useCallback((newData: Partial<BrandData>) => {
    setBrandData(prev => ({ ...prev, ...newData }));
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case Section.Core:
        return <BrandCoreSection brandData={brandData} updateBrandData={updateBrandData} />;
      case Section.Visual:
        return <VisualIdentitySection brandData={brandData} />;
      case Section.Messaging:
        return <MessagingSection brandData={brandData} />;
      case Section.Audit:
        return <AuditSection brandData={brandData} />;
      case Section.Academy:
        return <AcademySection />;
      case Section.Glossary:
        return <GlossarySection />;
      default:
        return <BrandCoreSection brandData={brandData} updateBrandData={updateBrandData} />;
    }
  };

  const getIcon = (sectionId: Section) => {
    const commonProps = { className: "w-6 h-6 mr-3" };
    switch (sectionId) {
      case Section.Core: return <CoreIcon {...commonProps} />;
      case Section.Visual: return <VisualIcon {...commonProps} />;
      case Section.Messaging: return <MessagingIcon {...commonProps} />;
      case Section.Audit: return <AuditIcon {...commonProps} />;
      case Section.Academy: return <AcademyIcon {...commonProps} />;
      case Section.Glossary: return <GlossaryIcon {...commonProps} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <header className="bg-white/80 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-slate-200 p-4 lg:p-6 lg:w-80 flex-shrink-0 sticky top-0 lg:sticky lg:h-screen z-10">
        <div className="flex items-center mb-8">
          <SparklesIcon className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Core Forge</h1>
        </div>
        <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center text-left w-full px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap group ${
                activeSection === section.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {getIcon(section.id)}
              <span className="font-medium">{section.title}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8 bg-slate-100">
        {renderSection()}
      </main>
    </div>
  );
};

export default App;