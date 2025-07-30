
import React, { useState } from 'react';
import SectionWrapper, { Card, CardTitle, AiButton } from './SectionWrapper';
import * as geminiService from '../services/geminiService';
import { BrandData } from '../types';
import Loader from './Loader';
import { SparklesIcon } from './IconComponents';
import { MarkdownRenderer } from './MarkdownRenderer';

interface BrandCoreSectionProps {
  brandData: BrandData;
  updateBrandData: (newData: Partial<BrandData>) => void;
}

const BrandCoreSection: React.FC<BrandCoreSectionProps> = ({ brandData, updateBrandData }) => {
  const [userInput, setUserInput] = useState('');
  const [ideas, setIdeas] = useState('');
  const [tone, setTone] = useState('Ingenioso y cercano');
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (type: 'archetype' | 'mvv' | 'voice') => {
    setLoading(type);
    setError(null);
    try {
      let response;
      if (type === 'archetype') {
        response = await geminiService.analyzeArchetype(userInput);
        if (response && !('error' in response)) {
          const json = JSON.parse(response.text);
          setResults(prev => ({ ...prev, archetype: json.explanation }));
          if (json.archetypeName) {
            updateBrandData({ archetype: json.archetypeName });
          }
        }
      } else if (type === 'mvv') {
        response = await geminiService.generateMissionVisionValues(ideas, brandData.archetype);
         if (response && !('error' in response)) {
            const json = JSON.parse(response.text);
            setResults(prev => ({ ...prev, mvv: json.options }));
        }
      } else if (type === 'voice') {
        response = await geminiService.generateVoiceToneExamples(brandData.archetype, tone, userInput);
        if (response && !('error' in response)) {
            const json = JSON.parse(response.text);
            const markdownText = `
### ${json.socialPost.title}
${json.socialPost.content}

### ${json.emailSubject.title}
${json.emailSubject.content}

### ${json.productDescription.title}
${json.productDescription.content}
            `;
            setResults(prev => ({ ...prev, voice: markdownText.trim() }));
            updateBrandData({ voice: tone });
        }
      }

      if (response && 'error' in response) {
        setError(response.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to parse response from AI.');
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const inputClasses = "w-full p-3.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-700 placeholder:text-slate-400";
  const textareaClasses = `${inputClasses} min-h-[120px] resize-none`;

  return (
    <SectionWrapper title="El Núcleo de tu Marca" description="Aquí forjamos los cimientos. Antes de un logo o un color, definimos tu propósito.">
      {error && <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">{error}</div>}
      
      <Card>
        <CardTitle>1. Análisis de Arquetipos de Marca con IA</CardTitle>
        <p className="text-slate-600 mb-5">Describe tu empresa, tu público y tus metas. La IA analizará tus respuestas para identificar tu arquetipo de marca dominante.</p>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ej: Somos una startup que crea software para ayudar a equipos remotos a colaborar de forma más creativa..."
          className={textareaClasses}
        />
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('archetype')} disabled={!userInput || loading === 'archetype'}>
              {loading === 'archetype' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
              Analizar Arquetipo
            </AiButton>
        </div>
        {results.archetype && (
          <MarkdownRenderer text={results.archetype} />
        )}
      </Card>

      <Card>
        <CardTitle>2. Definidor de Misión, Visión y Valores</CardTitle>
        <p className="text-slate-600 mb-5">Introduce ideas y conceptos clave. La IA, actuando como estratega, refinará tus ideas alineándolas con tu arquetipo: <strong className="text-violet-600">{brandData.archetype || 'Aún no definido'}</strong>.</p>
        <input
          type="text"
          value={ideas}
          onChange={(e) => setIdeas(e.target.value)}
          placeholder="Ej: innovación, comunidad, sostenibilidad, diseño simple..."
          className={inputClasses}
        />
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('mvv')} disabled={!ideas || !brandData.archetype || loading === 'mvv'}>
              {loading === 'mvv' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
              Generar Declaraciones
            </AiButton>
        </div>
        {results.mvv && (
            <div className="mt-6 space-y-4">
                {results.mvv.map((option: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                        <h4 className="font-bold text-slate-800">Opción {index + 1}</h4>
                        <p className="text-sm text-indigo-600 font-semibold mt-2">Misión:</p><p className="mb-2 text-slate-700">{option.mission}</p>
                        <p className="text-sm text-indigo-600 font-semibold">Visión:</p><p className="mb-2 text-slate-700">{option.vision}</p>
                        <p className="text-sm text-indigo-600 font-semibold">Valores:</p><p className="text-slate-700">{option.values.join(', ')}</p>
                        <button onClick={() => updateBrandData({mission: option.mission, vision: option.vision, values: option.values.join(', ')})} className="text-sm mt-3 px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors">Seleccionar esta opción</button>
                    </div>
                ))}
            </div>
        )}
      </Card>
      
      <Card>
        <CardTitle>3. Definición de Voz y Tono</CardTitle>
        <p className="text-slate-600 mb-5">Elige un tono y la IA generará ejemplos de texto (posts, emails) aplicando la voz de tu arquetipo para que veas tu marca en acción.</p>
        <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClasses}>
            <option>Ingenioso y cercano</option>
            <option>Formal y autoritario</option>
            <option>Inspirador y apasionado</option>
            <option>Minimalista y directo</option>
            <option>Juguetón y enérgico</option>
        </select>
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('voice')} disabled={!userInput || !brandData.archetype || loading === 'voice'}>
              {loading === 'voice' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
              Generar Ejemplos de Tono
            </AiButton>
        </div>
        {results.voice && (
          <MarkdownRenderer text={results.voice} />
        )}
      </Card>
    </SectionWrapper>
  );
};

export default BrandCoreSection;