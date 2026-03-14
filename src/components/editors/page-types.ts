// Type interfaces matching the site's pageTypes.ts
// These define the JSON structure stored in PageContent.body

export interface GeoPageBody {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  sections: Array<{ title: string; text: string }>;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}

export interface LegalBlock {
  key: string;
  title: string;
  type: "paragraph" | "keyvalue" | "list";
  text?: string;
  items?: string[];
  intro?: string;
  link?: { text: string; href: string };
  footer?: string;
}

export interface LegalPageBody {
  pageTitle: string;
  intro?: string;
  blocks: LegalBlock[];
  lastUpdate: string;
}

export interface ServiceSection {
  title: string;
  text: string;
  type: "paragraph" | "list" | "locations";
  items?: string[];
  locations?: Array<{ region: string; details: string }>;
}

export interface ServicePageBody {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  sections: ServiceSection[];
  faqTitle: string;
  faqItems: Array<{ question: string; answer: string }>;
  regionsTitle: string;
  regionsText: string;
  regionBordeaux: string;
  regionLyon: string;
  regionProvence: string;
  regionCoteAzur: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}

export interface AboutPageBody {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  storyParagraphs: string[];
  numbers: Array<{ value: string; label: string }>;
  team: Array<{ name: string; role: string; bio: string; image: string }>;
  philosophyTitle: string;
  philosophyParagraphs: string[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}

export interface FaqPageBody {
  title: string;
  subtitle: string;
  back: string;
  introTitle: string;
  introText: string;
  introP2: string;
  introP3: string;
  items: Array<{ question: string; answer: string }>;
  noresponse: string;
  contact: string;
}

// ─── DESTINATION WEDDING PAGE ────────────────────────────────────────────────

export interface DestinationWeddingPageBody {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  section1Title: string;
  section1Text: string;
  section2Title: string;
  section2Intro: string;
  locations: Array<{ name: string; desc: string }>;
  section3Title: string;
  section3Text: string;
  section4Title: string;
  section4Intro: string;
  services: string[];
  section5Title: string;
  section5Text: string;
  section6Title: string;
  tips: Array<{ title: string; text: string }>;
  faqTitle: string;
  faqItems: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}
