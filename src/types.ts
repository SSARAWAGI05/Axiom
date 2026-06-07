/* ═══════════════════════════════════════════
   AXIOM Admin Portal — Shared Types
   Every editable piece of content on the site.
   ═══════════════════════════════════════════ */

/* ── Core Enums ── */
export type Format = "Research Article" | "Opinion Piece" | "Interview" | "Analysis" | "Creative Writing";
export type DepartmentName = "Capital" | "Forum" | "Psyche" | "Frontier" | "Catalyst" | "Terra" | "Chronicle" | "Canvas";
export type IconName =
  | "BriefcaseBusiness" | "Landmark" | "Brain" | "FlaskConical"
  | "Code2" | "Globe2" | "Compass" | "Palette"
  | "BookOpen" | "Heart" | "Award" | "GraduationCap"
  | "Sparkles" | "Users" | "Layers3" | "Smartphone"
  | "PenLine" | "Send" | "FileText" | "Search"
  | "MessageCircle" | "Mail" | "MapPin" | "Phone";

/* ── Data Entities ── */
export interface Department {
  name: string;
  domain: string;
  description: string;
  color: string;
  icon: IconName;
}

export interface Article {
  id: string;
  title: string;
  department: string;
  format: Format;
  summary: string;
  readTime: string;
  author: string;
  content?: string;
  claps?: number;
}

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

export interface FounderData {
  name: string;
  role: string;
  photo: string;
  bio: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContactInfo {
  email: string;
  location: string;
  instagram: string;
}

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ActionCard {
  title: string;
  description: string;
  linkText: string;
}

export interface SubmitStep {
  number: string;
  title: string;
  description: string;
}

export interface SocialLinks {
  instagram: string;
  email: string;
  website: string;
}

/* ── Page Content Types ── */
export interface HomePageContent {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButton1: string;
  heroButton2: string;
  stats: StatItem[];
  actionSectionTitle: string;
  actionSectionSubtitle: string;
  actionCards: ActionCard[];
  deptPreviewTitle: string;
  deptPreviewSubtitle: string;
  deptPreviewButton: string;
  ctaHeading: string;
  ctaText: string;
  ctaButton: string;
}

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  description: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;
  founderSectionTitle: string;
  teamSectionTitle: string;
  teamSectionSubtitle: string;
  workflowSectionTitle: string;
  workflowSectionSubtitle: string;
  workflowSteps: WorkflowStep[];
  ctaHeading: string;
  ctaText: string;
  ctaButton1: string;
  ctaButton2: string;
}

export interface ContactPageContent {
  eyebrow: string;
  title: string;
  description: string;
  reachOutTitle: string;
  reachOutSubtitle: string;
  contactInfo: ContactInfo;
  formSuccessMessage: string;
  sendButtonText: string;
  faqSectionTitle: string;
  faqs: FAQ[];
}

export interface SubmitPageContent {
  eyebrow: string;
  title: string;
  description: string;
  steps: SubmitStep[];
  guidelinesTitle: string;
  guidelines: string[];
  formatsTitle: string;
  formats: string[];
  formSectionTitle1: string;
  formSectionTitle2: string;
  formLabels: {
    fullName: string;
    email: string;
    department: string;
    format: string;
    workingTitle: string;
    pitch: string;
    articleContent: string;
  };
  formPlaceholders: {
    fullName: string;
    email: string;
    departmentDefault: string;
    formatDefault: string;
    workingTitle: string;
    pitch: string;
    articleContent: string;
  };
  formNote: string;
  submitButton: string;
  bottomCtaHeading: string;
  bottomCtaText: string;
  bottomButton1: string;
  bottomButton2: string;
}

export interface JournalPageContent {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  filterDepartmentLabel: string;
  filterFormatLabel: string;
  allDepartmentsLabel: string;
  allFormatsLabel: string;
  emptyStateHeading: string;
  emptyStateText: string;
  emptyStateButton: string;
  ctaHeading: string;
  ctaText: string;
  ctaButton: string;
}

export interface DepartmentsPageContent {
  eyebrow: string;
  title: string;
  description: string;
}

export interface FooterContent {
  brandDescription: string;
  quickLinksHeading: string;
  departmentsHeading: string;
  getInvolvedHeading: string;
  getInvolvedText: string;
  getInvolvedButton: string;
  copyrightText: string;
  creditLine: string;
  socialLinks: SocialLinks;
}

export interface MarqueeContent {
  phrases: string[];
}

export interface PreloaderContent {
  letter1: string;
  letter2: string;
}

export interface SiteSettings {
  siteName: string;
  preloader: PreloaderContent;
  marquee: MarqueeContent;
}

/* ── Master Type ── */
export interface AxiomSiteData {
  siteSettings: SiteSettings;
  homePage: HomePageContent;
  departmentsPage: DepartmentsPageContent;
  journalPage: JournalPageContent;
  aboutPage: AboutPageContent;
  contactPage: ContactPageContent;
  submitPage: SubmitPageContent;
  footer: FooterContent;
  departments: Department[];
  articles: Article[];
  founder: FounderData;
  teamMembers: TeamMember[];
}

/* ── Admin Page Routing ── */
export type AdminPage =
  | "dashboard"
  | "site-settings"
  | "home-editor"
  | "departments-editor"
  | "articles-editor"
  | "team-editor"
  | "about-editor"
  | "contact-editor"
  | "submit-editor"
  | "footer-editor"
  | "submissions";
