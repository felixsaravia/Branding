
import React, { useState } from 'react';
import SectionWrapper, { Card, CardTitle, AiButton } from './SectionWrapper';
import * as geminiService from '../services/geminiService';
import Loader from './Loader';
import { SparklesIcon } from './IconComponents';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const BRANDING_GUIDE = {
  title: "Guía Rápida de Branding Digital",
  sections: [
    {
      heading: "🧠 ¿Qué es el Branding Digital?",
      content: "Es el proceso de construir y posicionar una marca en entornos digitales (web, redes sociales, correo electrónico, apps, etc.) para que tenga una identidad reconocible, conecte con su audiencia y cree valor."
    },
    {
      heading: "🎯 Objetivo del Branding Digital",
      content: "Lograr que las personas reconozcan, recuerden y prefieran tu marca en medios digitales, generando confianza y fidelidad."
    },
    {
      heading: "🧩 Componentes del Branding Digital",
      type: "table",
      headers: ["Componente", "¿Qué incluye?"],
      rows: [
        ["Identidad Visual", "Logo, paleta de colores, tipografía, estilos de imágenes y videos."],
        ["Voz y tono", "Cómo habla tu marca: formal, juvenil, profesional, divertida…"],
        ["Propuesta de valor", "¿Qué te hace único? ¿Por qué deberían elegirte a ti?"],
        ["Presencia digital", "Redes sociales, sitio web, blog, email marketing, marketplaces, etc."],
        ["Experiencia de usuario", "Navegación fácil, contenido útil, atención rápida, claridad visual."],
        ["Contenido", "Lo que publicas: videos, artículos, posts, stories, emails, cursos, etc."],
        ["Comunicación visual y verbal", "Uso coherente del lenguaje escrito, visual y audiovisual."],
      ]
    },
    {
        heading: "🧰 Herramientas esenciales",
        type: "table",
        headers: ["Finalidad", "Herramientas recomendadas"],
        rows: [
            ["Diseño de identidad", "Canva, Adobe Express, Looka (para crear logos), Coolors (paletas), Fontpair (tipografías)"],
            ["Gestión de redes", "Meta Business Suite, Hootsuite, Buffer, Metricool"],
            ["Contenido visual", "CapCut, Canva, InVideo, Adobe Premiere Rush"],
            ["Email marketing", "Mailchimp, Brevo, ConvertKit"],
            ["Sitio web y SEO", "WordPress, Wix, Squarespace, Google Search Console, Ubersuggest"],
            ["Análisis de marca", "Google Analytics, Meta Insights, Hotjar, Brand24 (para monitoreo de marca online)"],
            ["Brand Guidelines", "Frontify, Notion, Google Docs (para crear un manual de marca colaborativo)"]
        ]
    },
    {
        heading: "🧠 Términos clave en Branding Digital",
        type: "definitionList",
        items: [
            { term: "Brand Equity", definition: "Valor percibido de una marca. Se construye con experiencia, confianza, reputación." },
            { term: "Brand Awareness", definition: "Reconocimiento de marca: ¿qué tanto recuerdan a tu marca?" },
            { term: "Buyer Persona", definition: "Representación ficticia de tu cliente ideal." },
            { term: "Brand Voice", definition: "Personalidad verbal de la marca (cómo “habla”)." },
            { term: "Brand Positioning", definition: "Posicionamiento de marca: cómo te diferencias de tus competidores." },
            { term: "Touchpoints", definition: "Puntos de contacto con el usuario: redes, correo, web, chatbot, etc." },
            { term: "Consistency", definition: "Coherencia: repetir estilo, tono y valores en todos los medios." }
        ]
    },
    {
        heading: "📌 Tips de oro para un branding digital efectivo",
        type: "list",
        items: [
            "Define una identidad clara desde el inicio (no cambies logo, colores, tono todo el tiempo).",
            "Escucha a tu audiencia: usa encuestas, comentarios, análisis de redes.",
            "Crea contenido de valor, no solo vendas. Educa, entretén o inspira.",
            "Aprovecha el video marketing: Reels, TikToks y YouTube Shorts posicionan rápido.",
            "Alinea el branding con tu cultura interna si eres una empresa con equipo.",
            "Cuida tu reputación digital: responde comentarios, gestiona críticas con empatía.",
            "Sé constante en la publicación y estilo visual/verbal.",
            "Humaniza la marca: muestra rostros, procesos, equipo, historias reales.",
            "Usa plantillas y automatiza tareas repetitivas (contenido, email, respuestas).",
            "Evalúa y ajusta tu estrategia cada mes."
        ]
    },
    {
        heading: "📈 Métricas para evaluar tu branding digital",
        type: "table",
        headers: ["Métrica", "Qué mide", "Herramienta sugerida"],
        rows: [
            ["Reconocimiento de marca", "Búsquedas por nombre, menciones, etiquetas", "Google Trends, Brand24, Meta"],
            ["Engagement", "Likes, comentarios, compartidos, guardados", "Instagram Insights, Metricool"],
            ["Tasa de clics (CTR)", "Interacción con enlaces en anuncios o correos", "Google Ads, Mailchimp"],
            ["Tráfico al sitio", "Visitas y páginas vistas", "Google Analytics"],
            ["Tiempo de permanencia", "¿Se quedan en tu web? ¿Les gusta el contenido?", "Google Analytics, Hotjar"],
            ["Sentimiento del público", "Opiniones positivas/negativas", "Social listening (Brand24, Hootsuite)"],
            ["Lealtad del cliente", "Recompra, comunidad, referencias", "CRM, encuestas, WhatsApp"]
        ]
    },
  ]
};

const RESOURCES = {
    "Inspiración de Diseño": [
        { name: "Dribbble", url: "https://dribbble.com" },
        { name: "Behance", url: "https://www.behance.net" },
    ],
    "Blogs de Branding": [
        { name: "The Branding School", url: "https://www.thebrandingschool.com/blog" },
        { name: "Seth's Blog", url: "https://seths.blog" },
    ],
    "Herramientas Útiles": [
        { name: "Canva", url: "https://www.canva.com" },
        { name: "Semrush", url: "https://semrush.com" },
    ]
};

const AcademySection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);

    const userMessage: Message = { sender: 'user', text: question };
    setConversation(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      const response = await geminiService.answerBrandingQuestion(question);
      if (response && !('error' in response)) {
        const aiMessage: Message = { sender: 'ai', text: response.text };
        setConversation(prev => [...prev, aiMessage]);
      } else if (response && 'error' in response) {
        setError(response.error);
        const errorMessage: Message = { sender: 'ai', text: `Error: ${response.error}` };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (e: any) {
      const errorMessageText = e.message || "An unknown error occurred.";
      setError(errorMessageText);
      const errorMessage: Message = { sender: 'ai', text: `Error: ${errorMessageText}` };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-700 placeholder:text-slate-400";

  return (
    <SectionWrapper title="Academia de Branding" description="Conocimiento es poder. Conviértete en un experto de tu propia marca.">
      {error && <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

      <Card>
        <CardTitle>1. Base de Conocimiento Conversacional</CardTitle>
        <p className="text-slate-600 mb-5">Pregúntale a la IA cualquier duda sobre branding en lenguaje natural.</p>
        <div className="space-y-4 mb-4 h-96 overflow-y-auto p-4 bg-slate-100 rounded-lg border border-slate-200 flex flex-col">
            {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-white text-slate-700'}`}>
                        {msg.sender === 'user' ? (
                          <p>{msg.text}</p>
                        ) : (
                          <MarkdownRenderer text={msg.text} className="p-0 m-0 bg-transparent border-none" />
                        )}
                    </div>
                </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-white p-3 rounded-lg shadow-sm"><Loader size="6" /></div></div>}
        </div>
        <div className="flex gap-4">
            <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAskQuestion()}
                placeholder="¿Cuál es la diferencia entre branding y marketing?"
                className={`${inputClasses} flex-grow`}
            />
            <AiButton onClick={handleAskQuestion} disabled={loading || !question.trim()}>
                {loading ? <Loader color="white" size="5" /> : 'Preguntar'}
            </AiButton>
        </div>
      </Card>

      <Card>
        <CardTitle>{BRANDING_GUIDE.title}</CardTitle>
        <div className="space-y-8 mt-4">
            {BRANDING_GUIDE.sections.map((section, index) => (
                <div key={index}>
                    <h4 className="text-xl font-semibold text-indigo-700 mb-3">{section.heading}</h4>
                    {section.content && <p className="text-slate-600 leading-relaxed">{section.content}</p>}
                    {section.type === 'table' && section.rows && (
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {section.headers.map(header => <th key={header} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {section.rows.map((row, rIndex) => (
                                        <tr key={rIndex} className="hover:bg-slate-50/70 transition-colors">
                                            {row.map((cell, cIndex) => <td key={cIndex} className="px-4 py-3 text-sm text-slate-600 align-top">{cell}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {section.type === 'list' && section.items && (
                        <ul className="list-disc list-inside space-y-2 text-slate-600 pl-2">
                            {section.items.map((item, iIndex) => <li key={iIndex}>{item}</li>)}
                        </ul>
                    )}
                    {section.type === 'definitionList' && section.items && (
                        <dl className="space-y-3">
                            {section.items.map((item, iIndex) => (
                                <div key={iIndex} className="grid grid-cols-1 md:grid-cols-4 gap-1">
                                    <dt className="font-semibold text-slate-800 md:col-span-1">{item.term}</dt>
                                    <dd className="text-slate-600 md:col-span-3">{item.definition}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            ))}
        </div>
      </Card>
      
      <Card>
        <CardTitle>Recursos Externos Curados</CardTitle>
        <p className="text-slate-600 mb-5">Una biblioteca de los mejores recursos de la web para llevar tu marca al siguiente nivel.</p>
        <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(RESOURCES).map(([category, links]) => (
                <div key={category}>
                    <h4 className="font-semibold text-indigo-700 mb-2">{category}</h4>
                    <ul className="space-y-2">
                        {links.map(link => (
                            <li key={link.name}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-violet-600 hover:underline transition">
                                    {link.name} &rarr;
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </Card>
    </SectionWrapper>
  );
};

export default AcademySection;