
export enum Section {
  Core = 'core',
  Visual = 'visual',
  Messaging = 'messaging',
  Audit = 'audit',
  Academy = 'academy',
  Glossary = 'glossary',
}

export interface BrandData {
  archetype: string;
  mission: string;
  vision: string;
  values: string;
  voice: string;
}

export interface ColorPalette {
  name: string;
  hexCodes: string[];
  psychology: string;
}