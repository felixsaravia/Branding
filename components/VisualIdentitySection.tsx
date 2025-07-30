
import React, { useState, useCallback, useEffect } from 'react';
import SectionWrapper, { Card, CardTitle, AiButton } from './SectionWrapper';
import * as geminiService from '../services/geminiService';
import { BrandData, ColorPalette } from '../types';
import Loader from './Loader';
import { SparklesIcon } from './IconComponents';

interface VisualIdentitySectionProps {
  brandData: BrandData;
}

const VisualIdentitySection: React.FC<VisualIdentitySectionProps> = ({ brandData }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: any }>({});
  
  const [colorInputs, setColorInputs] = useState({ industry: '', emotions: '' });
  const [logoInputs, setLogoInputs] = useState({ keywords: '', style: 'Minimalista' });
  const [mockupInputs, setMockupInputs] = useState({ description: '', scene: 'Camiseta blanca' });
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageUpload = () => {
    setUploadedImagePreview(null);
    setUploadedImageFile(null);
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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

  const handleGenerate = async (type: 'colors' | 'logos' | 'typography' | 'mockup') => {
    setLoading(type);
    setError(null);
    setLoadingMessage('');
    try {
      let response;
      if (type === 'colors') {
        response = await geminiService.suggestColorPalette(brandData.archetype, colorInputs.industry, colorInputs.emotions);
        if (response && !('error' in response)) {
          const json = JSON.parse(response.text);
          setResults(prev => ({ ...prev, palettes: json }));
        }
      } else if (type === 'logos') {
        response = await geminiService.generateLogoConcepts(logoInputs.keywords, brandData.archetype, logoInputs.style);
        if (response && !('error' in response)) {
          setResults(prev => ({ ...prev, logos: response.generatedImages }));
        }
      } else if (type === 'typography') {
        response = await geminiService.suggestTypography(brandData.archetype);
        if (response && !('error' in response)) {
          const json = JSON.parse(response.text);
          setResults(prev => ({ ...prev, typography: json }));
        }
      } else if (type === 'mockup') {
        let descriptionForMockup = mockupInputs.description;

        if (uploadedImageFile) {
            setLoadingMessage('Analizando tu logo...');
            const base64Data = await fileToBase64(uploadedImageFile);
            const descriptionResponse = await geminiService.describeImageForMockup(base64Data, uploadedImageFile.type);

            if (descriptionResponse && !('error' in descriptionResponse)) {
                descriptionForMockup = descriptionResponse.text;
            } else {
                setError((descriptionResponse as { error: string }).error || "No se pudo describir la imagen.");
                setLoading(null);
                return;
            }
        }

        if (!descriptionForMockup) {
            setError("Por favor, sube una imagen o describe tu logo para generar el mockup.");
            setLoading(null);
            return;
        }

        setLoadingMessage('Generando mockup...');
        response = await geminiService.generateMockup(descriptionForMockup, mockupInputs.scene);
        if (response && !('error' in response)) {
          setResults(prev => ({ ...prev, mockups: response.generatedImages }));
        }
      }
      if (response && 'error' in response) setError(response.error);
    } catch (e: any) {
      setError(e.message || 'Failed to process AI request.');
    } finally {
      setLoading(null);
      setLoadingMessage('');
    }
  };

  useEffect(() => {
    if (results.typography) {
      const fonts = results.typography.flatMap((t: any) => [t.headlineFont, t.bodyFont]);
      const uniqueFonts = [...new Set(fonts)];
      uniqueFonts.forEach(font => {
        const fontName = (font as string).replace(/\s/g, '+');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      });
    }
  }, [results.typography]);

  const inputClasses = "w-full p-3.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-700 placeholder:text-slate-400";
  const textareaClasses = `${inputClasses} min-h-[100px] resize-y`;

  return (
    <SectionWrapper title="Identidad Visual Inteligente" description="Traducimos tu esencia en una imagen impactante. Visualiza tu marca antes de que exista.">
      {error && <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">{error}</div>}
       
      <Card>
        <CardTitle>1. Paleta de Colores Psicológica</CardTitle>
        <p className="text-slate-600 mb-5">Basado en tu arquetipo, industria y emociones, la IA sugerirá paletas y explicará la psicología de cada una. <strong className="text-violet-600">Arquetipo actual: {brandData.archetype || 'No definido'}</strong>.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Industria (ej: tecnología, bienestar)" value={colorInputs.industry} onChange={e => setColorInputs({...colorInputs, industry: e.target.value})} className={inputClasses}/>
          <input type="text" placeholder="Emociones a evocar (ej: confianza, energía)" value={colorInputs.emotions} onChange={e => setColorInputs({...colorInputs, emotions: e.target.value})} className={inputClasses}/>
        </div>
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('colors')} disabled={!brandData.archetype || !colorInputs.industry || !colorInputs.emotions || loading === 'colors'}>
                {loading === 'colors' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Generar Paletas
            </AiButton>
        </div>
        {results.palettes && (
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {results.palettes.map((p: ColorPalette, i: number) => (
              <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">{p.name}</h4>
                <div className="flex space-x-1 mb-3 h-10">
                  {p.hexCodes.map(hex => <div key={hex} className="w-full rounded" style={{backgroundColor: hex}}></div>)}
                </div>
                <p className="text-sm text-slate-600">{p.psychology}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <Card>
        <CardTitle>2. Generador de Logos Conceptuales</CardTitle>
        <p className="text-slate-600 mb-5">Introduce palabras clave y un estilo para generar ideas visuales que te inspiren. <strong className="text-violet-600">Arquetipo actual: {brandData.archetype || 'No definido'}</strong>.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Palabras clave (ej: zorro, rápido, inteligente)" value={logoInputs.keywords} onChange={e => setLogoInputs({...logoInputs, keywords: e.target.value})} className={inputClasses}/>
          <select value={logoInputs.style} onChange={e => setLogoInputs({...logoInputs, style: e.target.value})} className={inputClasses}>
            <option>Minimalista</option><option>Geométrico</option><option>Orgánico</option><option>Abstracto</option>
          </select>
        </div>
        <div className="mt-5">
            <AiButton onClick={() => handleGenerate('logos')} disabled={!brandData.archetype || !logoInputs.keywords || loading === 'logos'}>
                {loading === 'logos' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Generar Conceptos de Logo
            </AiButton>
        </div>
        {loading === 'logos' && <div className="flex justify-center mt-4"><Loader /></div>}
        {results.logos && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {results.logos.map((img: any, i: number) => (
              <img key={i} src={`data:image/jpeg;base64,${img.image.imageBytes}`} alt={`Logo concept ${i+1}`} className="rounded-lg bg-slate-100 p-2 border border-slate-200 aspect-square object-contain" />
            ))}
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardTitle>3. Sugerencia de Tipografías</CardTitle>
          <p className="text-slate-600 mb-5">Obtén combinaciones de fuentes que complementen tu identidad. <strong className="text-violet-600">Arquetipo actual: {brandData.archetype || 'No definido'}</strong>.</p>
          <div className="mt-5">
            <AiButton onClick={() => handleGenerate('typography')} disabled={!brandData.archetype || loading === 'typography'}>
              {loading === 'typography' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Sugerir Tipografías
            </AiButton>
          </div>
          {results.typography && (
            <div className="mt-6 space-y-4">
              {results.typography.map((t: any, i: number) => (
                <div key={i} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <p style={{ fontFamily: `'${t.headlineFont}', sans-serif` }} className="text-xl font-bold text-slate-800">{t.headlineFont} <span className="text-base font-normal text-slate-500">(Títulos)</span></p>
                  <p style={{ fontFamily: `'${t.bodyFont}', sans-serif` }} className="text-lg mt-1">{t.bodyFont} <span className="text-base font-normal text-slate-500">(Cuerpo)</span></p>
                  <p style={{ fontFamily: `'${t.bodyFont}', sans-serif` }} className="text-slate-600 mt-3">{t.justification}</p>
                </div>
              ))}
              <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" className="inline-block text-violet-600 hover:text-violet-800 transition-colors mt-4 font-semibold">Explorar en Google Fonts &rarr;</a>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>4. Generador de Mockups IA</CardTitle>
          <p className="text-slate-600 mb-5">Visualiza tu marca en el mundo real. Sube una imagen de tu logo o descríbelo para generar un mockup.</p>
          
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sube una imagen de tu logo:</label>
                  <div className="flex items-center gap-4">
                      <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-lg font-semibold text-sm hover:bg-violet-200 transition-colors">
                          Seleccionar archivo
                      </label>
                      <input id="logo-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                      {uploadedImageFile && <span className="text-sm text-slate-500 truncate">{uploadedImageFile.name}</span>}
                  </div>
                  {uploadedImagePreview && (
                    <div className="mt-4 relative inline-block">
                        <img src={uploadedImagePreview} alt="Preview" className="h-24 w-24 object-contain rounded-md border border-slate-300 p-1 bg-white" />
                        <button onClick={clearImageUpload} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 transition-colors">&times;</button>
                    </div>
                  )}
              </div>
              <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-300"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-sm">O</span>
                  <div className="flex-grow border-t border-slate-300"></div>
              </div>
              <textarea
                placeholder="Describe tu logo (ej: Un zorro naranja de estilo origami)"
                value={mockupInputs.description}
                onChange={e => setMockupInputs({...mockupInputs, description: e.target.value})}
                disabled={!!uploadedImageFile}
                className={`${textareaClasses} ${!!uploadedImageFile ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              />
          </div>

          <select value={mockupInputs.scene} onChange={e => setMockupInputs({...mockupInputs, scene: e.target.value})} className={`${inputClasses} mt-4`}>
            <option>Camiseta blanca</option>
            <option>Taza de café negra</option>
            <option>Pantalla de smartphone</option>
            <option>Tarjeta de visita sobre un escritorio de madera</option>
            <option>Bolsa de tela color crema</option>
          </select>
          <div className="mt-5">
            <AiButton onClick={() => handleGenerate('mockup')} disabled={(!mockupInputs.description && !uploadedImageFile) || loading === 'mockup'}>
                {loading === 'mockup' ? <Loader color="white" size="5" className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />} Generar Mockup
            </AiButton>
          </div>
          {loading === 'mockup' && (
            <div className="flex justify-center items-center mt-4 space-x-3 text-slate-600">
                <Loader />
                <span>{loadingMessage || 'Generando...'}</span>
            </div>
          )}
          {results.mockups && (
            <div className="mt-6 flex justify-center">
              {results.mockups.map((img: any, i: number) => (
                <img key={i} src={`data:image/jpeg;base64,${img.image.imageBytes}`} alt={`Mockup image ${i+1}`} className="rounded-lg aspect-square object-cover max-w-md" />
              ))}
            </div>
          )}
        </Card>
      </div>
    </SectionWrapper>
  );
};

export default VisualIdentitySection;