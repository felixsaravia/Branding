
import React, { useState } from 'react';
import SectionWrapper, { Card, CardTitle, AiButton } from './SectionWrapper';
import * as geminiService from '../services/geminiService';
import { BrandData } from '../types';
import Loader from './Loader';
import { SparklesIcon } from './IconComponents';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessagingSectionProps {
  brandData: BrandData;
}

const MessagingSection: React.FC<MessagingSectionProps> = ({ brandData }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  
  const [nameInputs, setNameInputs] = useState({ keywords: '', industry: '' });
  const [copyRequest, setCopyRequest] = useState('');

  const handleGenerate = async (type: 'names' | 'copy') => {
    setLoading(type);
    setError(null);
    try {
      let response;
      if (type === 'names') {
        response = await geminiService.generateNamesAndSlogans(nameInputs.keywords, nameInputs.industry);
        if (response && !('error' in response)) {
          const json = JSON.parse(response.text);
          setResults(prev => ({ ...prev, namesAndSlogans: json }));
        }
      } else if (type === 'copy') {
        response = await geminiService.generateCopy(copyRequest, brandData);
        if (response && !('error' in response)) {
          setResults(prev => ({ ...prev, copy: response.text }));
        }
      }
      if (response && 'error' in response) setError(response.error);
    } catch (e: any) {
      setError(e.message || 'Failed to process AI request.');
    } finally {
      setLoading(null);
    }
  };
  
  const inputClasses = "w-full p-3.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-700 placeholder:text-slate-400";
  const textareaClasses = `${inputClasses} min-h-[120px] resize-none`;

  return (
    <SectionWrapper title="Mensajería y Contenido" description="Dale a tu marca una voz que resuene. Palabras que venden, conectan y convierten.">
      {error && <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">{error}</div>}
      <p className="text-lg text-center text-indigo-800 bg-indigo-100/70 border border-indigo-200 p-4 rounded-xl mb-6">Usando Arquetipo: <strong className="font-bold text-slate-800">{brandData.archetype || 'No definido'}</strong> y Voz: <strong className="font-bold text-slate-800">{brandData.voice || 'No definida'}</strong></p>

      <Card>
        <CardTitle>1. Generador de Nombres y Slogans</CardTitle>
        <p className="text-slate-600 mb-5">Introduce palabras clave y tu industria para recibir cientos de opciones creativas para nombres y lemas.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Palabras clave (ej: café, rápido, mañana)" value={nameInputs.keywords} onChange={e => setNameInputs({...nameInputs, keywords: e.target.value})} className={inputClasses}/>
          <input type="text" placeholder="Industria (ej: alimentos y bebidas)" value={nameInputs.industry} onChange={e => setNameInputs({...nameInputs, industry: e.target.value})} className={inputClasses}/>
        </div>
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('names')} disabled={!nameInputs.keywords || !nameInputs.industry || loading === 'names'}>
                {loading === 'names' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Brainstorm de Nombres
            </AiButton>
        </div>
        {results.namesAndSlogans && (
          <div className="mt-6 grid md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-4">
              <h4 className="font-bold text-xl text-slate-800 mb-2">Nombres Sugeridos</h4>
              {results.namesAndSlogans.names.map((cat: any, i: number) => (
                <div key={i}>
                  <h5 className="font-semibold text-indigo-600">{cat.category}</h5>
                  <ul className="list-disc list-inside text-slate-600">
                    {cat.options.map((opt: string, j: number) => <li key={j}>{opt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-xl text-slate-800 mb-2">Slogans Sugeridos</h4>
              <ul className="list-disc list-inside text-slate-600">
                {results.namesAndSlogans.slogans.map((slogan: string, i: number) => <li key={i}>{slogan}</li>)}
              </ul>
            </div>
          </div>
        )}
      </Card>
      
      <Card>
        <CardTitle>2. Asistente de Copywriting IA</CardTitle>
        <p className="text-slate-600 mb-5">Pidele a la IA que escriba textos clave para tu marca. Sé específico con tu petición para obtener los mejores resultados.</p>
        <textarea
          value={copyRequest}
          onChange={(e) => setCopyRequest(e.target.value)}
          placeholder="Ej: Escríbeme la sección 'Sobre Nosotros' con un tono de 'El Sabio'. O 'Genera 3 ideas para un post de Instagram anunciando nuestro lanzamiento'."
          className={textareaClasses}
        />
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('copy')} disabled={!copyRequest || !brandData.archetype || loading === 'copy'}>
                {loading === 'copy' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Generar Copy
            </AiButton>
        </div>
        {results.copy && (
          <MarkdownRenderer text={results.copy} />
        )}
      </Card>
    </SectionWrapper>
  );
};

export default MessagingSection;