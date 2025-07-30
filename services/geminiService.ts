import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// This check is removed as it causes build failures on platforms like Vercel.
// The API key is injected at runtime via index.html
// if (!process.env.API_KEY) {
//   throw new Error("API_KEY environment variable not set");
// }

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-3.0-generate-002';

const safeApiCall = async <T,>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T | { error: string }> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    let message = "An unknown error occurred.";
    if (error instanceof Error) {
        message = error.message;
    }
    
    if (typeof message === 'string' && (message.includes('429') || message.toUpperCase().includes('RESOURCE_EXHAUSTED'))) {
        return { error: "Has excedido tu cuota de uso actual. Por favor, inténtalo de nuevo más tarde o revisa tu plan y facturación en Google AI Studio. Este es un límite de la API, no un error de la aplicación." };
    }
    
    return { error: `Error de la IA: ${message}` };
  }
};

export const describeImageForMockup = async (base64Data: string, mimeType: string): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Describe this logo with precise and literal detail for a text-to-image AI model. Focus on shapes, colors, composition, style (e.g., flat, 3D, minimalist, geometric), and any text elements. Be concise. Provide only the description, nothing else. The description must be in Spanish.`;
  return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
    }),
    "Error describing image:"
  );
};


export const analyzeArchetype = async (userInput: string): Promise<GenerateContentResponse | { error: string }> => {
  return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: `Actúa como un experto en branding. Basado en la siguiente descripción de empresa, identifica el arquetipo de marca dominante (ej: El Héroe, El Sabio, El Mago). Proporciona el nombre del arquetipo y una explicación detallada de su psicología, su voz y ejemplos de marcas exitosas que lo utilizan. Haz que el análisis sea único y perspicaz para el usuario. La respuesta DEBE ser completamente en español. Descripción del usuario: "${userInput}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetypeName: { 
              type: Type.STRING,
              description: "El nombre del arquetipo de marca identificado (ej: El Sabio)."
            },
            explanation: { 
              type: Type.STRING,
              description: "La explicación detallada en formato markdown sobre el arquetipo."
            }
          }
        }
      }
    }),
    "Error analyzing archetype:"
  );
};

export const generateMissionVisionValues = async (ideas: string, archetype: string): Promise<GenerateContentResponse | { error: string }> => {
  return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: `Actúa como un estratega de marca. El arquetipo de marca del usuario es "${archetype}". Basado en estas palabras clave: "${ideas}", genera 3 opciones distintas de un conjunto de Misión, Visión y Valores. Las declaraciones deben ser potentes, concisas y alineadas con el arquetipo. Todo el texto generado DEBE estar en español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mission: { type: Type.STRING },
                  vision: { type: Type.STRING },
                  values: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    }),
    "Error generating mission/vision/values:"
  );
};

export const generateVoiceToneExamples = async (archetype: string, tone: string, businessDescription: string): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Actúa como un redactor de marca experto.
- Descripción del negocio del usuario: "${businessDescription}"
- Arquetipo de la marca: "${archetype}"
- Tono a aplicar: "${tone}"

Basado en la descripción específica del negocio, genera 3 ejemplos cortos y relevantes de texto aplicando la voz del arquetipo y el tono solicitado. Los ejemplos deben ser para diferentes contextos y estar directamente relacionados con el negocio descrito.
1.  **Publicación para Redes Sociales:** Un post corto y atractivo.
2.  **Asunto de Correo de Marketing:** Un asunto que incite a abrir el correo.
3.  **Descripción de un Producto/Servicio:** Una breve descripción para una web o catálogo.

Toda la respuesta DEBE ser completamente en español y estar en formato JSON.`;
  return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            socialPost: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            },
            emailSubject: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            },
            productDescription: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          }
        }
      }
    }),
    "Error generating voice/tone examples:"
  );
};

export const suggestColorPalette = async (archetype: string, industry: string, emotions: string): Promise<GenerateContentResponse | { error: string }> => {
  return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: `Actúa como un experto en branding y psicología del color. Para una marca en la industria "${industry}", con un arquetipo de "${archetype}" que quiere evocar sentimientos de "${emotions}", sugiere 3 paletas de colores estratégicas. Para cada paleta, proporciona un nombre, un array de 5-6 códigos hexadecimales, y una explicación detallada en español de la psicología detrás de la combinación de colores y por qué es una buena opción. Todo el texto generado DEBE estar en español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hexCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
              psychology: { type: Type.STRING }
            }
          }
        }
      }
    }),
    "Error suggesting color palettes:"
  );
};

export const generateLogoConcepts = async (keywords: string, archetype: string, style: string) => {
  const prompt = `A conceptual, symbolic, low-resolution logo for a brand. Archetype: ${archetype}. Keywords: ${keywords}. Style: ${style}. Clean background.`;
  return safeApiCall(
    () => ai.models.generateImages({
      model: imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 2,
        aspectRatio: '1:1',
      }
    }),
    "Error generating logo concepts:"
  );
};

export const suggestTypography = async (archetype: string): Promise<GenerateContentResponse | { error: string }> => {
    return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: `Actúa como un experto en tipografía. Para una marca con el arquetipo "${archetype}", recomienda 2 combinaciones de fuentes (una para titulares, una para cuerpo de texto) de Google Fonts. Para cada combinación, proporciona los nombres de las fuentes (ej: "Montserrat & Lora") y una justificación en español basada en la legibilidad, personalidad y alineación con la marca. Toda la respuesta DEBE ser completamente en español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
                headlineFont: { type: Type.STRING },
                bodyFont: { type: Type.STRING },
                justification: { type: Type.STRING }
            }
          }
        }
      }
    }),
    "Error suggesting typography:"
  );
};

export const generateMockup = async (description: string, scene: string) => {
  const prompt = `A high-quality, photorealistic mockup featuring a logo on an object.
  **Object & Scene:** ${scene}. The setting should be clean, modern, and well-lit to highlight the product.
  **Logo Description:** The logo to be placed on the object is described as: "${description}". The logo should be clearly visible and integrated naturally onto the object's surface.
  Generate a professional product photograph. Do not include any text other than the logo itself.`;
  
  return safeApiCall(
    () => ai.models.generateImages({
      model: imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1'
      }
    }),
    "Error generating mockup images:"
  );
};

export const generateNamesAndSlogans = async (keywords: string, industry: string): Promise<GenerateContentResponse | { error: string }> => {
  return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: `Actúa como un experto creativo en branding. Para una empresa en la industria "${industry}", con las palabras clave "${keywords}", genera una lista de posibles nombres de marca y eslóganes. Proporciona 20 nombres categorizados por estilo (ej: Moderno, Clásico, Abstracto) y 10 eslóganes que capturen una propuesta de valor única. Toda la respuesta DEBE ser completamente en español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            names: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            slogans: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }),
    "Error generating names and slogans:"
  );
};

export const generateCopy = async (copyRequest: string, brandData: any): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Actúa como un redactor personal para una marca con la siguiente identidad:
- Arquetipo: ${brandData.archetype || 'No definido'}
- Misión: ${brandData.mission || 'No definida'}
- Voz: ${brandData.voice || 'No definida'}

Cumple esta petición: "${copyRequest}". Asegúrate de que el texto generado sea perfectamente consistente con la voz, el tono y la identidad general de la marca definidos. La respuesta DEBE ser completamente en español.`;
  return safeApiCall(
    () => ai.models.generateContent({ model: textModel, contents: prompt }),
    "Error generating copy:"
  );
};


export const auditContent = async (content: string, brandData: any): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Actúa como un meticuloso auditor de marca.
Perfil de Identidad de Marca:
- Arquetipo: ${brandData.archetype || 'No definido'}
- Misión: ${brandData.mission || 'No definida'}
- Voz/Tono: ${brandData.voice || 'No definido'}

Analiza el siguiente contenido enviado por el usuario para verificar su consistencia con el Perfil de Identidad de Marca.
Contenido a Analizar:
---
${content}
---

Proporciona un informe de auditoría detallado en español. El informe debe incluir:
1. Una "Puntuación de Coherencia de Marca" de 1 a 100.
2. Un desglose de tu análisis, comentando específicamente:
    - Consistencia del Lenguaje y Tono: ¿El lenguaje coincide con la voz definida?
    - Alineación del Mensaje: ¿El mensaje central está alineado con la misión de la marca?
3. Una lista de 3-5 recomendaciones concretas y accionables para mejorar.
La respuesta DEBE ser completamente en español.
`;
  return safeApiCall(
    () => ai.models.generateContent({ model: textModel, contents: prompt }),
    "Error auditing content:"
  );
};


export const generateChecklist = async (businessType: string): Promise<GenerateContentResponse | { error: string }> => {
    return safeApiCall(
    () => ai.models.generateContent({
      model: textModel,
      contents: `Actúa como un director de proyectos de branding. Crea una checklist de lanzamiento de marca completa y personalizada para un negocio de tipo "${businessType}". La checklist debe ser dinámica y cubrir todas las etapas clave, desde el trabajo fundamental hasta el lanzamiento. Incluye tareas como "Registrar dominio", "Crear perfiles en redes sociales", "Diseñar plantillas de correo electrónico", etc. Toda la respuesta, incluyendo todas las tareas y categorías, DEBE ESTAR EN ESPAÑOL.`,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    task: { type: Type.STRING },
                    category: { type: Type.STRING }
                }
            }
        }
      }
    }),
    "Error generating checklist:"
  );
};

export const answerBrandingQuestion = async (question: string): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Actúa como un experto en branding amable y conocedor. Un usuario ha hecho la siguiente pregunta. Proporciona una respuesta detallada, clara y práctica con ejemplos, completamente en español.
Pregunta: "${question}"`;
  return safeApiCall(
    () => ai.models.generateContent({ model: textModel, contents: prompt }),
    "Error answering question:"
  );
};

// --- NEW ANALYSIS FUNCTIONS ---

export const analyzeMissionVision = async (missionVisionText: string, archetype: string): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Actúa como un estratega de marca senior. El arquetipo de marca del usuario es "${archetype}". Analiza las siguientes declaraciones de misión y visión: "${missionVisionText}". Evalúa su claridad, impacto, alineación con el arquetipo y si son inspiradoras. Proporciona un feedback constructivo y sugerencias para mejorarlas. La respuesta DEBE ser completamente en español.`;
  return safeApiCall(
    () => ai.models.generateContent({ model: textModel, contents: prompt }),
    "Error analyzing mission/vision:"
  );
};

export const analyzeColorPalette = async (colors: string[], archetype: string): Promise<GenerateContentResponse | { error: string }> => {
  const prompt = `Actúa como un experto en psicología del color y branding. El arquetipo de marca del usuario es "${archetype}". Analiza esta paleta de colores: ${colors.filter(c => c).join(', ')}. Evalúa la armonía, el contraste y la psicología de la combinación de colores. ¿Es adecuada para el arquetipo? ¿Qué emociones evoca? Proporciona un análisis detallado y sugerencias. La respuesta DEBE ser completamente en español.`;
  return safeApiCall(
    () => ai.models.generateContent({ model: textModel, contents: prompt }),
    "Error analyzing color palette:"
  );
};

export const describeLogoForAnalysis = async (base64Data: string, mimeType: string): Promise<GenerateContentResponse | { error: string }> => {
    const prompt = `Describe este logo con el máximo detalle posible para un análisis de branding. Enfócate en sus formas, colores, tipografía (si la hay), composición, estilo (ej: minimalista, corporativo, orgánico) y simbolismo potencial. Sé objetivo y descriptivo. La respuesta debe estar en español.`;
    return safeApiCall(
        () => ai.models.generateContent({
            model: textModel,
            contents: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt },
            ],
        }),
        "Error describing logo for analysis:"
    );
};

export const analyzeLogoDescription = async (logoDescription: string, archetype: string): Promise<GenerateContentResponse | { error: string }> => {
    const prompt = `Actúa como un crítico de diseño y experto en branding. El arquetipo de marca del usuario es "${archetype}". Basado en esta descripción detallada de un logo: "${logoDescription}", analiza su efectividad. Evalúa si el logo parece memorable, versátil, apropiado para el arquetipo y si comunica los valores correctos. Proporciona un análisis constructivo. La respuesta DEBE ser completamente en español.`;
    return safeApiCall(
        () => ai.models.generateContent({ model: textModel, contents: prompt }),
        "Error analyzing logo description:"
    );
};