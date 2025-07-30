
import React, { useState, useMemo } from 'react';
import SectionWrapper, { Card } from './SectionWrapper';

const GLOSSARY_TERMS = [
    { term: "Arquetipo de Marca", definition: "Un conjunto de patrones de personalidad o modelos de personaje que definen la esencia de una marca para hacerla más identificable y humana. Ejemplos: El Héroe, El Sabio, El Mago." },
    { term: "Brand Awareness (Reconocimiento de Marca)", definition: "El grado en que los consumidores reconocen y recuerdan una marca. Es una métrica clave para medir la notoriedad y presencia en el mercado." },
    { term: "Brand Equity (Valor de Marca)", definition: "El valor comercial derivado de la percepción del consumidor sobre una marca, en lugar de sobre el producto o servicio en sí. Se construye con confianza, reputación y experiencia." },
    { term: "Brand Guidelines (Manual de Marca)", definition: "Un documento oficial que establece las reglas sobre cómo se debe presentar la marca en todos los medios. Incluye el uso del logo, la paleta de colores, la tipografía y el tono de voz." },
    { term: "Branding", definition: "El proceso estratégico y creativo de crear y gestionar una marca para darle una identidad única y una posición distintiva en la mente de la audiencia." },
    { term: "Buyer Persona", definition: "Una representación semi-ficticia de tu cliente ideal, basada en datos de mercado e investigación. Ayuda a entender y conectar con la audiencia." },
    { term: "Claim / Eslogan", definition: "Una frase corta y memorable que encapsula la promesa, la misión o la propuesta de valor de una marca. Ej: \"Just Do It\" de Nike." },
    { term: "Identidad Visual", definition: "El conjunto de elementos visuales que representan a una marca, incluyendo el logo, la paleta de colores, la tipografía, y el estilo de imágenes y videos." },
    { term: "Logotipo", definition: "El símbolo gráfico, emblema o nombre estilizado que identifica a una empresa, producto u organización. Es la piedra angular de la identidad visual." },
    { term: "Marketing", definition: "El conjunto de actividades y estrategias destinadas a promocionar y vender productos o servicios, incluyendo la investigación de mercado y la publicidad. El branding define la marca, el marketing la da a conocer." },
    { term: "Misión", definition: "Una declaración que define el propósito fundamental de una empresa: qué hace, para quién lo hace y por qué lo hace." },
    { term: "Moodboard (Panel de Inspiración)", definition: "Un collage de imágenes, texturas, colores y textos que se utiliza para definir y comunicar la atmósfera visual y el estilo de una marca." },
    { term: "Paleta de Colores", definition: "El conjunto específico de colores seleccionados para representar la identidad visual de una marca. Cada color tiene una psicología y un significado asociados." },
    { term: "Posicionamiento (Positioning)", definition: "El lugar distintivo que una marca ocupa en la mente de su público objetivo en comparación con sus competidores." },
    { term: "Propuesta de Valor", definition: "La declaración que explica el beneficio principal que una marca ofrece a sus clientes y por qué deberían elegirla sobre la competencia." },
    { term: "Tono de Voz", definition: "La forma específica en que se aplica la voz de la marca. Si la voz es la personalidad, el tono es el estado de ánimo (ej. formal, humorístico, urgente)." },
    { term: "Touchpoint (Punto de Contacto)", definition: "Cualquier interacción o encuentro que un cliente tiene con una marca. Incluye el sitio web, las redes sociales, el empaque del producto, el servicio al cliente, etc." },
    { term: "Valores de Marca", definition: "Los principios y creencias fundamentales que guían el comportamiento y las decisiones de una empresa." },
    { term: "Visión", definition: "Una declaración que describe las aspiraciones a largo plazo de una empresa; lo que espera lograr en el futuro." },
    { term: "Voz de Marca", definition: "La personalidad única de una marca expresada a través de las palabras. Define cómo se comunica la marca de manera consistente." },
];

const GlossarySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = useMemo(() => {
    if (!searchTerm) {
      return GLOSSARY_TERMS;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return GLOSSARY_TERMS.filter(item =>
      item.term.toLowerCase().includes(lowercasedFilter) ||
      item.definition.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);

  const inputClasses = "w-full p-3.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-slate-700 placeholder:text-slate-400";

  return (
    <SectionWrapper title="Glosario de Branding" description="Un diccionario rápido para entender los conceptos clave del mundo del branding.">
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar un término..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="space-y-4">
        {filteredTerms.length > 0 ? (
            filteredTerms.map(item => (
                <div key={item.term} className="p-6 bg-white rounded-xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800">{item.term}</h3>
                    <p className="mt-2 text-slate-600 leading-relaxed">{item.definition}</p>
                </div>
            ))
        ) : (
            <p className="text-center text-slate-500 py-8">No se encontraron términos que coincidan con tu búsqueda.</p>
        )}
      </div>
    </SectionWrapper>
  );
};

export default GlossarySection;