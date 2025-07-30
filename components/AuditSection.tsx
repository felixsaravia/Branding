
import React, { useState } from 'react';
import SectionWrapper, { Card, CardTitle, AiButton } from './SectionWrapper';
import * as geminiService from '../services/geminiService';
import { BrandData } from '../types';
import Loader from './Loader';
import { SparklesIcon } from './IconComponents';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AuditSectionProps {
  brandData: BrandData;
}

interface ChecklistItem {
    id: number;
    task: string;
    category: string;
    completed: boolean;
}

type AnalysisTab = 'mvv' | 'palette' | 'logo';

const AuditSection: React.FC<AuditSectionProps> = ({ brandData }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for existing features
  const [auditContent, setAuditContent] = useState('');
  const [businessType, setBusinessType] = useState('E-commerce');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  
  // State for new analysis feature
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('mvv');
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{ [key: string]: any }>({});
  const [missionVisionInput, setMissionVisionInput] = useState('');
  const [colorPaletteInputs, setColorPaletteInputs] = useState<string[]>(Array(6).fill(''));
  const [logoUpload, setLogoUpload] = useState<{file: File | null, preview: string | null}>({file: null, preview: null});
  const [analysisLoadingMessage, setAnalysisLoadingMessage] = useState('');


  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colorPaletteInputs];
    newColors[index] = value;
    setColorPaletteInputs(newColors);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoUpload({ file, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    setAnalysisLoading(activeAnalysisTab);
    setAnalysisError(null);
    setAnalysisLoadingMessage('');
    try {
        let response;
        if (activeAnalysisTab === 'mvv') {
            response = await geminiService.analyzeMissionVision(missionVisionInput, brandData.archetype);
        } else if (activeAnalysisTab === 'palette') {
            response = await geminiService.analyzeColorPalette(colorPaletteInputs, brandData.archetype);
        } else if (activeAnalysisTab === 'logo') {
            if (!logoUpload.file) {
                setAnalysisError('Por favor, sube una imagen de tu logo.');
                setAnalysisLoading(null);
                return;
            }
            setAnalysisLoadingMessage('Analizando descripción del logo...');
            const base64 = await fileToBase64(logoUpload.file);
            const descriptionResponse = await geminiService.describeLogoForAnalysis(base64, logoUpload.file.type);

            if (descriptionResponse && !('error' in descriptionResponse)) {
                setAnalysisLoadingMessage('Evaluando efectividad del logo...');
                response = await geminiService.analyzeLogoDescription(descriptionResponse.text, brandData.archetype);
            } else {
                response = descriptionResponse; // Propagate the error
            }
        }
        
        if (response && !('error' in response)) {
            setAnalysisResults(prev => ({ ...prev, [activeAnalysisTab]: response.text }));
        } else if (response && 'error' in response) {
            setAnalysisError(response.error);
        }

    } catch(e: any) {
        setAnalysisError(e.message || 'Error desconocido durante el análisis.');
    } finally {
        setAnalysisLoading(null);
        setAnalysisLoadingMessage('');
    }
  };

  const handleGenerate = async (type: 'audit' | 'checklist') => {
    setLoading(type);
    setError(null);
    try {
      let response;
      if (type === 'audit') {
        response = await geminiService.auditContent(auditContent, brandData);
        if (response && !('error' in response)) {
          setResults(prev => ({ ...prev, auditReport: response.text }));
        }
      } else if (type === 'checklist') {
        response = await geminiService.generateChecklist(businessType);
        if (response && !('error' in response)) {
          const json = JSON.parse(response.text);
          if (Array.isArray(json)) {
            const itemsFromApi = json as Array<{task: string, category: string}>;
            const formattedChecklist: ChecklistItem[] = itemsFromApi.map((item, index) => ({
              ...item,
              id: index,
              completed: false,
            }));
            setChecklist(formattedChecklist);
          } else {
            setError("La IA devolvió un formato inesperado para la checklist.");
            console.error("Expected an array for checklist, but received:", json);
          }
        }
      }
      if (response && 'error' in response) setError(response.error);
    } catch (e: any) {
      setError(e.message || 'Failed to process AI request.');
    } finally {
      setLoading(null);
    }
  };

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? {...item, completed: !item.completed} : item));
  };

  const inputClasses = "w-full p-3.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-700 placeholder:text-slate-400";
  const textareaClasses = `${inputClasses} min-h-[160px] resize-none`;

  const TabButton: React.FC<{tabId: AnalysisTab, children: React.ReactNode}> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveAnalysisTab(tabId)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeAnalysisTab === tabId ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
    >
      {children}
    </button>
  );

  return (
    <SectionWrapper title="Auditoría y Checklist" description="Evalúa tu presente y planifica tu futuro. Asegura una consistencia a prueba de todo.">
      {error && <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      <Card>
        <CardTitle>1. Analizador de Elementos de Marca</CardTitle>
        <p className="text-slate-600 mb-5">Obtén un análisis experto de la IA sobre tus elementos de marca existentes. Para mejores resultados, define primero tu arquetipo en "El Núcleo de tu Marca".</p>
        
        <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-4">
            <TabButton tabId="mvv">Misión y Visión</TabButton>
            <TabButton tabId="palette">Paleta de Colores</TabButton>
            <TabButton tabId="logo">Logo</TabButton>
        </div>

        {analysisError && <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">{analysisError}</div>}
        
        <div className="animate-fadeIn">
            {activeAnalysisTab === 'mvv' && (
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Analizar Misión, Visión y Valores</h4>
                    <textarea value={missionVisionInput} onChange={e => setMissionVisionInput(e.target.value)} placeholder="Pega aquí tu Misión, Visión y/o Valores existentes..." className={textareaClasses}></textarea>
                </div>
            )}
            {activeAnalysisTab === 'palette' && (
                <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Analizar Paleta de Colores</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {colorPaletteInputs.map((color, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full border-2 border-slate-200 mb-2" style={{ backgroundColor: color || '#f1f5f9' }}></div>
                                <input type="text" value={color} onChange={e => handleColorChange(index, e.target.value)} placeholder="#C0FFEE" className={`${inputClasses} text-center`}/>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeAnalysisTab === 'logo' && (
                 <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Analizar Logo</h4>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    {logoUpload.preview && <img src={logoUpload.preview} alt="Logo preview" className="mt-4 h-32 w-32 object-contain rounded-md border border-slate-200 p-2 bg-white"/>}
                </div>
            )}
        </div>

        <div className="mt-5">
            <AiButton onClick={handleAnalyze} disabled={analysisLoading !== null}>
                {analysisLoading ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Analizar Ahora
            </AiButton>
        </div>
        
        {analysisLoading && <div className="flex items-center space-x-2 mt-4 text-slate-600"><Loader /><span>{analysisLoadingMessage || 'Analizando...'}</span></div>}
        {analysisResults[activeAnalysisTab] && (
            <MarkdownRenderer text={analysisResults[activeAnalysisTab]} />
        )}
      </Card>

      <Card>
        <CardTitle>2. Auditor de Presencia Digital</CardTitle>
        <p className="text-slate-600 mb-5">Pega texto de tu web o redes sociales. La IA lo analizará contra tu identidad de marca (<strong className="text-violet-600">{brandData.archetype || 'indefinido'}</strong>) y generará un informe de coherencia.</p>
        <textarea
          value={auditContent}
          onChange={(e) => setAuditContent(e.target.value)}
          placeholder="Pega aquí el texto de tu sección 'Sobre Nosotros', un post de tu blog, o las descripciones de tus últimos 5 posts de Instagram..."
          className={textareaClasses}
        />
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('audit')} disabled={!auditContent || !brandData.archetype || loading === 'audit'}>
                {loading === 'audit' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Auditar Contenido
            </AiButton>
        </div>
        {results.auditReport && (
          <MarkdownRenderer text={results.auditReport} />
        )}
      </Card>
      
      <Card>
        <CardTitle>3. Checklist Interactivo de Lanzamiento de Marca</CardTitle>
        <p className="text-slate-600 mb-5">Selecciona tu tipo de negocio y la IA generará un checklist personalizado para tu lanzamiento.</p>
        <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputClasses}>
            <option>E-commerce</option><option>SaaS</option><option>Marca Personal</option><option>Servicios Profesionales</option>
        </select>
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('checklist')} disabled={loading === 'checklist'}>
                {loading === 'checklist' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Generar Checklist
            </AiButton>
        </div>
        
        {loading === 'checklist' && <div className="flex justify-center mt-6"><Loader /></div>}
        {checklist.length > 0 && (
          <div className="mt-6 space-y-6">
            {Object.entries(checklist.reduce((acc, item) => {
                (acc[item.category] = acc[item.category] || []).push(item);
                return acc;
            }, {} as {[key: string]: ChecklistItem[]})).map(([category, items]) => (
                <div key={category}>
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3 border-b border-slate-200 pb-2">{category}</h4>
                    <div className="space-y-3">
                    {items.map(item => (
                        <label key={item.id} className="flex items-center p-4 bg-slate-50/80 rounded-lg cursor-pointer hover:bg-indigo-50 border border-slate-200 transition-colors">
                            <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item.id)} className="h-5 w-5 rounded bg-slate-200 border-slate-300 text-violet-600 focus:ring-violet-500 flex-shrink-0"/>
                            <span className={`ml-4 text-sm sm:text-base ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.task}</span>
                        </label>
                    ))}
                    </div>
                </div>
            ))}
          </div>
        )}
      </Card>
    </SectionWrapper>
  );
};

export default AuditSection;