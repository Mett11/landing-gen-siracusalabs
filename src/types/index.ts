/**
 * SIRACUSA LABS — AI Landing Studio
 * Core Type Definitions
 */

export type LandingType = 'seller' | 'optin';

export type ProjectStatus =
  | 'draft'
  | 'analyzing'
  | 'strategic_review'
  | 'generating'
  | 'in_review'
  | 'ready'
  | 'deploying'
  | 'published'
  | 'error';

export interface UserSession {
  email: string;
  name: string;
  role: 'owner' | 'guest';
  isAuthenticated: boolean;
  token?: string;
}

export interface BusinessBrief {
  businessName: string;
  slug: string;
  industry: string;
  websiteUrl?: string;
  socialUrls?: string[];
  serviceToPromote: string;
  landingType: LandingType;
  businessGoal: string;
  targetAudience: string;
  geographicArea: string;
  primaryOffer: string;
  realBenefits: string[];
  primaryCtaLabel: string;
  primaryCtaType: 'whatsapp' | 'phone' | 'form' | 'calendar' | 'checkout' | 'external';
  primaryCtaDestination: string;
  secondaryCtaLabel?: string;
  secondaryCtaDestination?: string;
  contactMethod: 'whatsapp' | 'phone' | 'form' | 'calendar' | 'email';
  availableMaterials: {
    logoAvailable: boolean;
    hasRealPhotos: boolean;
    reviewsCount?: number;
    hasVerifiedTestimonials: boolean;
    customNotes?: string;
  };
  stylePreferences?: {
    aesthetic: AestheticArchetype;
    tone: 'autorevole' | 'diretto' | 'esclusivo' | 'caldo_umano' | 'scientifico';
    accentColor?: string;
  };
  desiredSubdomain?: string;
}

export interface SiteAnalysisReport {
  analyzedUrl: string;
  extractedTitle?: string;
  extractedMetaDescription?: string;
  verifiedFacts: string[];
  observations: string[];
  hypotheses: string[];
  missingInformation: string[];
  improvementOpportunities: string[];
  detectedHeadings: string[];
  detectedOfferings: string[];
  detectedCallsToAction: string[];
  trustSignalsDetected: string[];
  securityStatus: {
    isHttps: boolean;
    ssrfVerifiedSafe: boolean;
    contentLengthBytes: number;
  };
  analyzedAt: string;
}

export interface StrategicConcept {
  id: string;
  title: string;
  angle: string;
  pros: string;
  cons: string;
  recommendedFor: string;
  selected: boolean;
}

export interface ConversionStrategy {
  idealCustomerProfile: string;
  mainProblem: string;
  desiredOutcome: string;
  valueProposition: string;
  provableDifferentiators: string[];
  offerAndPositioning: string;
  mainObjections: {
    objection: string;
    counterArgument: string;
  }[];
  availableProof: string[];
  persuasiveAngle: string;
  conversionFunnelPath: string[];
  primaryCta: string;
  secondaryCta: string;
  narrativeStructure: {
    sectionKey: string;
    title: string;
    objective: string;
    keyPoints: string[];
  }[];
  croHypotheses: string[];
  concepts: StrategicConcept[];
  selectedConceptId: string;
  approved: boolean;
  approvedAt?: string;
  version: number;
}

export interface GeminiModelInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  isRecommended?: boolean;
  category: 'fast' | 'pro' | 'latest' | 'other';
}

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  badge?: string;
  image?: string;
  imageUrl?: string;
  dietaryTag?: string;
  provenance?: string;
}

export interface CopywritingSection {
  id: string;
  type:
    | 'hero'
    | 'problem_agitation'
    | 'solution_value'
    | 'how_it_works'
    | 'offer_pricing'
    | 'social_proof'
    | 'faq'
    | 'final_cta'
    | 'optin_form'
    | 'menu_showcase'
    | 'experience_story'
    | 'atmosphere_gallery'
    | 'reservation_widget';
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  bodyMarkdown?: string;
  bulletPoints?: string[];
  ctaText?: string;
  ctaSecondaryText?: string;
  badge?: string;
  guaranteeText?: string;
  heroImage?: string;
  mediaImages?: string[];
  quote?: string;
  quoteAuthor?:
    | string
    | {
        name: string;
        role: string;
        quote: string;
        rating?: number;
      };
  menuItems?: MenuItem[];
  reservationConfig?: {
    defaultPartySize: number;
    timeSlots: string[];
    tableTypes: string[];
    cancellationPolicy?: string;
  };
  faqItems?: { question: string; answer: string }[];
  stats?: { label: string; value: string; sourceVerified: boolean }[];
  pricingCards?: {
    name: string;
    price: string;
    periodicity?: string;
    features: string[];
    isPopular?: boolean;
    ctaText: string;
  }[];
  unverifiedWarnings?: string[];
}

export interface CopywritingPlan {
  language: string;
  sections: CopywritingSection[];
  generatedAt: string;
  lastEditedAt?: string;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  muted: string;
  border: string;
}

export interface MotionTokens {
  personality: 'premium' | 'playful' | 'corporate' | 'energetic' | 'calm';
  signatureEasing: string;
  durationQuick: string;
  durationStandard: string;
  durationSlow: string;
  ambientStyle: 'subtle_float' | 'gentle_pulse' | 'glow_drift' | 'zen_breathe' | 'scanline' | 'none';
  cardHoverEffect: 'lift_shadow' | 'border_glow' | 'hard_pop' | 'glass_shine' | 'subtle_scale';
}

export type AestheticArchetype =
  | 'editorial_luxury'
  | 'warm_artisan'
  | 'architectural_modern'
  | 'brutalist_neocraft'
  | 'swiss_international'
  | 'cyber_terminal'
  | 'mediterranean_solaris'
  | 'japanese_zen_wabi'
  | 'kinetic_neo_pop'
  | 'nordic_frost_clean'
  | 'steampunk_copper_alchemist'
  | 'dark_velvet_noir'
  | 'high_tech_precision'
  | 'swiss_minimalist';

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  googleFontsUrl: string;
  headingWeight: string;
  typeScaleRatio: string;
}

export interface DesignPlan {
  aesthetic: AestheticArchetype;
  themeColors: ThemeColors;
  typography: TypographyConfig;
  visualLayout: {
    heroLayout: 'split_statement' | 'centered_impact' | 'editorial_asymmetric' | 'magazine_grid';
    containerWidth: string;
    borderRadius: string;
    verticalSpacing: string;
    buttonStyle:
      | 'pill'
      | 'geometric_sharp'
      | 'minimal_bordered'
      | 'heavy_elevated'
      | 'hard_shadow'
      | 'kintsugi_gold'
      | 'terminal_cli'
      | 'cyber_glow';
  };
  cardStyle:
    | 'bordered'
    | 'elevated_subtle'
    | 'raw_editorial'
    | 'solid_contrast'
    | 'glassmorphism'
    | 'raw_brutalist'
    | 'terminal_box'
    | 'velvet_glow';
  motionTokens?: MotionTokens;
}

export interface AstroProjectCode {
  packageJson: string;
  astroConfig: string;
  indexAstro: string;
  layoutAstro: string;
  globalCss: string;
  components: Record<string, string>;
  robotsTxt: string;
  sitemapXml: string;
}

export interface AuditCheck {
  id: string;
  name: string;
  category: 'seo' | 'cro' | 'security' | 'accessibility' | 'content_integrity';
  severity: 'blocking' | 'warning' | 'info';
  status: 'pass' | 'fail' | 'warn';
  message: string;
  recommendation?: string;
}

export interface QualityAuditReport {
  score: number;
  passed: boolean;
  blockingCount: number;
  warningCount: number;
  infoCount: number;
  checks: AuditCheck[];
  auditedAt: string;
}

export interface CloudflareDeployHistory {
  deploymentId: string;
  timestamp: string;
  url: string;
  status: 'success' | 'failed';
  commitMessage: string;
}

export interface CloudflareDeployInfo {
  projectName: string;
  subdomain: string;
  customDomain?: string;
  latestDeploymentId?: string;
  productionUrl?: string;
  previewUrl?: string;
  deployedAt?: string;
  status: 'none' | 'pending' | 'success' | 'failed';
  dnsInstructions?: {
    type: string;
    name: string;
    content: string;
    status: 'active' | 'pending';
  }[];
  history: CloudflareDeployHistory[];
}

export interface ProjectVersion {
  versionId: string;
  versionNumber: number;
  createdAt: string;
  description: string;
  snapshot: {
    brief: BusinessBrief;
    strategy?: ConversionStrategy;
    copywriting?: CopywritingPlan;
    designPlan?: DesignPlan;
    astroCode?: AstroProjectCode;
    auditResults?: QualityAuditReport;
  };
}

export interface Project {
  id: string;
  brief: BusinessBrief;
  status: ProjectStatus;
  analysisReport?: SiteAnalysisReport;
  strategy?: ConversionStrategy;
  copywriting?: CopywritingPlan;
  designPlan?: DesignPlan;
  astroCode?: AstroProjectCode;
  auditResults?: QualityAuditReport;
  cloudflare: CloudflareDeployInfo;
  versions: ProjectVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface CloudflareSettings {
  accountId: string;
  apiToken: string;
  baseDomain?: string;
  zoneId?: string;
}
