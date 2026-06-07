const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
`import {
  createContext,
  FormEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";`,
`import {
  createContext,
  FormEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "./lib/supabase";
import { AxiomSiteData, Department, Article, TeamMember, FAQ, Format, DepartmentName } from "./types";`
);

app = app.replace(/type Page = [^;]+;/, 'type Page = "home" | "departments" | "journal" | "about" | "contact" | "submit" | "article";');
app = app.replace(/type Format = [^;]+;/, '');
app = app.replace(/type DepartmentName = [^;]+;/, '');
app = app.replace(/type Department = [^;]+;/, '');
app = app.replace(/type Article = [^;]+;/, '');
app = app.replace(/type Submission = [^;]+;/, 'type Submission = { id: string; name: string; email: string; department: string; format: string; title: string; pitch: string };');
app = app.replace(/const departments: Department\[\] = \[\s*\{[\s\S]*?\},\s*\];/, '');
app = app.replace(/const articles: Article\[\] = \[\s*\{[\s\S]*?\},\s*\];/, '');
app = app.replace(/const formats: Format\[\] = \[\"Research Article\", \"Opinion Piece\", \"Interview\", \"Analysis\", \"Creative Writing\"\];/, '');
app = app.replace(/function deptFor\(n: DepartmentName\) \{ return departments\.find\(d => d\.name === n\)!; \}/, 'function deptFor(depts: Department[], n: string) { return depts.find(d => d.name === n) || depts[0]; }');

app = app.replace(/type TeamMember = [^;]+;/, '');
app = app.replace(/const founder = \{[\s\S]*?\};/, '');
app = app.replace(/const teamMembers: TeamMember\[\] = \[\s*\{[\s\S]*?\},\s*\];/, '');

app = app.replace(/const NavCtx = createContext<\{([\s\S]*?)\}>\((\{[\s\S]*?\})\);/, 
`const NavCtx = createContext<{ 
  page: Page; 
  activeArticle?: string; 
  activeDepartment?: string | "All";
  go: (p: Page, opts?: { articleId?: string, department?: string | "All" }) => void 
}>({ page: "home", go: () => {} });

const SiteCtx = createContext<AxiomSiteData | null>(null);
export function useSiteData() { return useContext(SiteCtx)!; }
`);

app = app.replace(/function HomePage\(\) \{([\s\S]*?)const r1 = useReveal\(\);/,
`function HomePage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const r1 = useReveal();`);

app = app.replace(/<span className="eyebrow"><GraduationCap size=\{16\} \/> Student-led intellectual journal<\/span>/, `<span className="eyebrow"><GraduationCap size={16} /> {config.homePage.eyebrow}</span>`);
app = app.replace(/<h1>AXIOM<\/h1>/, `<h1>{config.homePage.heroTitle}</h1>`);
app = app.replace(/<p className="hero-subtitle">Where serious ideas find their platform\.<\/p>/, `<p className="hero-subtitle">{config.homePage.heroSubtitle}</p>`);
app = app.replace(/<p className="hero-desc">[\s\S]*?<\/p>/, `<p className="hero-desc">{config.homePage.heroDescription}</p>`);
app = app.replace(/Explore Journal <ArrowRight size=\{18\} \/>/, `{config.homePage.heroButton1} <ArrowRight size={18} />`);
app = app.replace(/Submit Work <PenLine size=\{18\} \/>/, `{config.homePage.heroButton2} <PenLine size={18} />`);

app = app.replace(/<div className="stats-bar" ref=\{r1\}>\s*<div className="stat"><strong>8<\/strong><span>Departments<\/span><\/div>\s*<div className="stat"><strong>5<\/strong><span>Formats<\/span><\/div>\s*<div className="stat"><strong>3<\/strong><span>Platforms<\/span><\/div>\s*<div className="stat"><strong>∞<\/strong><span>Ideas<\/span><\/div>\s*<\/div>/,
`<div className="stats-bar" ref={r1}>
  {config.homePage.stats.map((s, i) => (
    <div className="stat" key={i}><strong>{s.value}</strong><span>{s.label}</span></div>
  ))}
</div>`);

app = app.replace(/<h2 className="section-title">What is AXIOM\?<\/h2>/, `<h2 className="section-title">{config.homePage.actionSectionTitle}</h2>`);
app = app.replace(/<p className="section-sub">Three pillars of the student intellectual experience<\/p>/, `<p className="section-sub">{config.homePage.actionSectionSubtitle}</p>`);

app = app.replace(/<div className="card-trio">([\s\S]*?)<\/div>\s*<\/section>\s*\{\/\* Featured departments preview \*\/\}/,
`<div className="card-trio">
  {config.homePage.actionCards.map((c, i) => {
    const icons = [<BookOpen />, <Layers3 />, <Send />];
    const actions = [() => go("journal"), () => go("departments"), () => go("submit")];
    return (
      <button className="action-card" key={i} onClick={actions[i]}>
        <div className="action-card-icon">{icons[i]}</div>
        <strong>{c.title}</strong>
        <span>{c.description}</span>
        <span className="card-link">{c.linkText} <ChevronRight size={16} /></span>
      </button>
    );
  })}
</div>
</section>
{/* Featured departments preview */}`);

app = app.replace(/<h2 className="section-title">Departments at a glance<\/h2>/, `<h2 className="section-title">{config.homePage.deptPreviewTitle}</h2>`);
app = app.replace(/<p className="section-sub">Eight editorial worlds covering every intellectual frontier<\/p>/, `<p className="section-sub">{config.homePage.deptPreviewSubtitle}</p>`);

app = app.replace(/departments\.slice\(0, 4\)\.map/g, `config.departments.slice(0, 4).map`);

app = app.replace(/View all departments <ArrowRight size=\{16\} \/>/, `{config.homePage.deptPreviewButton} <ArrowRight size={16} />`);

app = app.replace(/<h2>Ready to publish your ideas\?<\/h2>/, `<h2>{config.homePage.ctaHeading}</h2>`);
app = app.replace(/<p>AXIOM is open for student submissions across all departments and formats\.<\/p>/, `<p>{config.homePage.ctaText}</p>`);
app = app.replace(/Start Writing <PenLine size=\{18\} \/>/, `{config.homePage.ctaButton} <PenLine size={18} />`);

app = app.replace(/function DepartmentsPage\(\) \{([\s\S]*?)const r1 = useReveal\(\);/,
`function DepartmentsPage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const r1 = useReveal();`);

app = app.replace(/<span className="eyebrow"><Layers3 size=\{16\} \/> Departments<\/span>/, `<span className="eyebrow"><Layers3 size={16} /> {config.departmentsPage.eyebrow}</span>`);
app = app.replace(/<h1>Eight editorial worlds\.<\/h1>/, `<h1>{config.departmentsPage.title}</h1>`);
app = app.replace(/<p>AXIOM organizes student ideas into clear departments so readers can discover work quickly and contributors know where their voice belongs\.<\/p>/, `<p>{config.departmentsPage.description}</p>`);

app = app.replace(/departments\.map\(\(d, i\)/g, `config.departments.map((d, i)`);

app = app.replace(/function JournalPage\(\{ initialDept \}: \{ initialDept: DepartmentName \| "All" \}\) \{([\s\S]*?)const \{ go \} = useContext\(NavCtx\);/,
`function JournalPage({ initialDept }: { initialDept: string | "All" }) {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const formats = ["Research Article", "Opinion Piece", "Interview", "Analysis", "Creative Writing"];`);

app = app.replace(/const \[deptFilter, setDeptFilter\] = useState<DepartmentName \| "All">\(initialDept\);/, `const [deptFilter, setDeptFilter] = useState<string | "All">(initialDept);`);
app = app.replace(/const \[fmtFilter, setFmtFilter\] = useState<Format \| "All">\("All"\);/, `const [fmtFilter, setFmtFilter] = useState<string | "All">("All");`);

app = app.replace(/articles\.filter\(a => \{/g, `config.articles.filter(a => {`);
app = app.replace(/const featured = articles\[0\];/g, `const featured = config.articles[0];`);
app = app.replace(/const featuredDept = deptFor\(featured\.department\);/g, `const featuredDept = featured ? deptFor(config.departments, featured.department) : config.departments[0];`);

app = app.replace(/<span className="eyebrow"><BookOpen size=\{16\} \/> Journal<\/span>/, `<span className="eyebrow"><BookOpen size={16} /> {config.journalPage.eyebrow}</span>`);
app = app.replace(/<h1>Read sharp student work\.<\/h1>/, `<h1>{config.journalPage.title}</h1>`);
app = app.replace(/<p>Browse editorial previews across all departments and formats\. Each piece is student-written, peer-reviewed, and published by AXIOM\.<\/p>/, `<p>{config.journalPage.description}</p>`);
app = app.replace(/placeholder="Search articles\.\.\."/, `placeholder={config.journalPage.searchPlaceholder}`);
app = app.replace(/<span className="filter-label">Department<\/span>/, `<span className="filter-label">{config.journalPage.filterDepartmentLabel}</span>`);
app = app.replace(/<button className=\{\`dept-chip \$\{deptFilter === "All" \? "active" : ""\}\`} onClick=\{.*?\}\>All<\/button>/, `<button className={\`dept-chip \${deptFilter === "All" ? "active" : ""}\`} onClick={() => setDeptFilter("All")}>{config.journalPage.allDepartmentsLabel}</button>`);
app = app.replace(/<span className="filter-label">Format<\/span>/, `<span className="filter-label">{config.journalPage.filterFormatLabel}</span>`);
app = app.replace(/<button className=\{\`fmt-pill \$\{fmtFilter === "All" \? "active" : ""\}\`} onClick=\{.*?\}\>All Formats<\/button>/, `<button className={\`fmt-pill \${fmtFilter === "All" ? "active" : ""}\`} onClick={() => setFmtFilter("All")}>{config.journalPage.allFormatsLabel}</button>`);

app = app.replace(/<h3>No articles found<\/h3>/, `<h3>{config.journalPage.emptyStateHeading}</h3>`);
app = app.replace(/<p>Try adjusting your search or filters\.<\/p>/, `<p>{config.journalPage.emptyStateText}</p>`);
app = app.replace(/<MagneticButton className="btn btn-ghost" onClick=\{.*?\}\>Clear all filters<\/MagneticButton>/, `<MagneticButton className="btn btn-ghost" onClick={() => { setQuery(""); setDeptFilter("All"); setFmtFilter("All"); }}>{config.journalPage.emptyStateButton}</MagneticButton>`);

app = app.replace(/const d = deptFor\(a\.department\);/g, `const d = deptFor(config.departments, a.department);`);

app = app.replace(/<h3>Have something to say\?<\/h3>/, `<h3>{config.journalPage.ctaHeading}</h3>`);
app = app.replace(/<p>Submit your own article to AXIOM and get published across our platforms\.<\/p>/, `<p>{config.journalPage.ctaText}</p>`);
app = app.replace(/<MagneticButton className="btn btn-primary" onClick=\{.*?\}\>Submit Your Work <PenLine size=\{16\} \/><\/MagneticButton>/, `<MagneticButton className="btn btn-primary" onClick={() => go("submit")}>{config.journalPage.ctaButton} <PenLine size={16} /></MagneticButton>`);

app = app.replace(/function AboutPage\(\) \{([\s\S]*?)const \{ go \} = useContext\(NavCtx\);/,
`function AboutPage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();`);

app = app.replace(/teamMembers\.length/g, `config.teamMembers.length`);
app = app.replace(/teamMembers\.map/g, `config.teamMembers.map`);
app = app.replace(/founder\.photo/g, `config.founder.photo`);
app = app.replace(/founder\.name/g, `config.founder.name`);
app = app.replace(/founder\.role/g, `config.founder.role`);
app = app.replace(/founder\.bio/g, `config.founder.bio`);

app = app.replace(/<span className="eyebrow"><Users size=\{16\} \/> About AXIOM<\/span>/, `<span className="eyebrow"><Users size={16} /> {config.aboutPage.eyebrow}</span>`);
app = app.replace(/<h1>The story behind the journal\.<\/h1>/, `<h1>{config.aboutPage.title}</h1>`);
app = app.replace(/<p>AXIOM is a student-led intellectual journal built on the belief that young minds deserve a serious, well-structured platform to share their ideas with the world\.<\/p>/, `<p>{config.aboutPage.description}</p>`);

app = app.replace(/<h3>Our Mission<\/h3>\s*<p>.*?<\/p>/, `<h3>{config.aboutPage.missionTitle}</h3><p>{config.aboutPage.missionText}</p>`);
app = app.replace(/<h3>Our Vision<\/h3>\s*<p>.*?<\/p>/, `<h3>{config.aboutPage.visionTitle}</h3><p>{config.aboutPage.visionText}</p>`);
app = app.replace(/<h3>Our Values<\/h3>\s*<p>.*?<\/p>/, `<h3>{config.aboutPage.valuesTitle}</h3><p>{config.aboutPage.valuesText}</p>`);

app = app.replace(/<h2 className="section-title">Meet the Founder<\/h2>/, `<h2 className="section-title">{config.aboutPage.founderSectionTitle}</h2>`);
app = app.replace(/<h2 className="section-title">The Core Team<\/h2>/, `<h2 className="section-title">{config.aboutPage.teamSectionTitle}</h2>`);
app = app.replace(/<p className="section-sub">The people who make AXIOM possible<\/p>/, `<p className="section-sub">{config.aboutPage.teamSectionSubtitle}</p>`);

app = app.replace(/<h2 className="section-title">How AXIOM operates<\/h2>/, `<h2 className="section-title">{config.aboutPage.workflowSectionTitle}</h2>`);
app = app.replace(/<p className="section-sub">A clear, three-step editorial workflow ensures quality and consistency\.<\/p>/, `<p className="section-sub">{config.aboutPage.workflowSectionSubtitle}</p>`);

app = app.replace(/\{\(\[\s*\["01", "Create", ".*?"\],\s*\["02", "Review", ".*?"\],\s*\["03", "Publish", ".*?"\],\s*\] as const\)\.map\(\(\[num, title, text\], i\) => \(/,
`{config.aboutPage.workflowSteps.map((step, i) => {
  const num = step.number; const title = step.title; const text = step.description; return (`);

app = app.replace(/<h2>Join the AXIOM community<\/h2>/, `<h2>{config.aboutPage.ctaHeading}</h2>`);
app = app.replace(/<p>Whether you want to write, review, or build — there's a place for you\.<\/p>/, `<p>{config.aboutPage.ctaText}</p>`);
app = app.replace(/Submit Your Work <Send size=\{18\} \/>/, `{config.aboutPage.ctaButton1} <Send size={18} />`);
app = app.replace(/Get in Touch <Mail size=\{18\} \/>/, `{config.aboutPage.ctaButton2} <Mail size={18} />`);

app = app.replace(/function ContactPage\(\) \{([\s\S]*?)const r1 = useReveal\(\);/,
`function ContactPage() {
  const config = useSiteData();
  const r1 = useReveal();`);

app = app.replace(/function handleSubmit\(e: FormEvent<HTMLFormElement>\) \{[\s\S]*?\}/,
`async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await supabase.from('contact_messages').insert([{
        name: fd.get("name"),
        email: fd.get("email"),
        subject: fd.get("subject"),
        message: fd.get("message")
      }]);
      setSent(true);
      e.currentTarget.reset();
    } catch(err) {
      console.error(err);
    }
  }`);

app = app.replace(/<span className="eyebrow"><Mail size=\{16\} \/> Contact<\/span>/, `<span className="eyebrow"><Mail size={16} /> {config.contactPage.eyebrow}</span>`);
app = app.replace(/<h1>Get in touch with us\.<\/h1>/, `<h1>{config.contactPage.title}</h1>`);
app = app.replace(/<p>Have a question, suggestion, or collaboration idea\? We'd love to hear from you\.<\/p>/, `<p>{config.contactPage.description}</p>`);
app = app.replace(/<h2 className="section-title">Reach out<\/h2>/, `<h2 className="section-title">{config.contactPage.reachOutTitle}</h2>`);
app = app.replace(/<p className="section-sub">We typically respond within 24–48 hours\.<\/p>/, `<p className="section-sub">{config.contactPage.reachOutSubtitle}</p>`);

app = app.replace(/<span>axiomjournal@email\.com<\/span>/, `<span>{config.contactPage.contactInfo.email}</span>`);
app = app.replace(/<span>Student Activities Office<\/span>/, `<span>{config.contactPage.contactInfo.location}</span>`);
app = app.replace(/<span>@axiomjournal<\/span>/, `<span>{config.contactPage.contactInfo.instagram}</span>`);

app = app.replace(/Your message has been sent! We'll get back to you soon\./, `{config.contactPage.formSuccessMessage}`);
app = app.replace(/Send Message <Send size=\{18\} \/>/, `{config.contactPage.sendButtonText} <Send size={18} />`);

app = app.replace(/<h2 className="section-title">Frequently Asked Questions<\/h2>/, `<h2 className="section-title">{config.contactPage.faqSectionTitle}</h2>`);
app = app.replace(/<div className="faq-grid">[\s\S]*?<\/div>\s*<\/section>/,
`<div className="faq-grid">
  {config.contactPage.faqs.map((faq, i) => (
    <div className="faq-item" key={i}><h3>{faq.question}</h3><p>{faq.answer}</p></div>
  ))}
</div>
</section>`);


app = app.replace(/function SubmitPage\(\) \{([\s\S]*?)const \{ go \} = useContext\(NavCtx\);/,
`function SubmitPage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const formats = ["Research Article", "Opinion Piece", "Interview", "Analysis", "Creative Writing"];`);

app = app.replace(/function submitWork\(e: FormEvent<HTMLFormElement>\) \{[\s\S]*?\}/,
`async function submitWork(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sub = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      department: String(fd.get("department")),
      format: String(fd.get("format")),
      title: String(fd.get("title")),
      pitch: String(fd.get("pitch"))
    };
    try {
      await supabase.from('article_submissions').insert([sub]);
      setSubmissions(prev => [{ id: \`s-\${Date.now()}\`, ...sub }, ...prev]);
      e.currentTarget.reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch(err) {
      console.error(err);
    }
  }`);

app = app.replace(/<span className="eyebrow"><PenLine size=\{16\} \/> Submit Your Work<\/span>/, `<span className="eyebrow"><PenLine size={16} /> {config.submitPage.eyebrow}</span>`);
app = app.replace(/<h1>Publish with AXIOM\.<\/h1>/, `<h1>{config.submitPage.title}</h1>`);
app = app.replace(/<p>We welcome original student work across all eight departments and five formats\. Submit your idea and our editorial team will review it\.<\/p>/, `<p>{config.submitPage.description}</p>`);

app = app.replace(/<section className="submit-steps" ref=\{r1\}>[\s\S]*?<\/section>/,
`<section className="submit-steps" ref={r1}>
  {config.submitPage.steps.map((step, i) => (
    <React.Fragment key={i}>
      <div className="submit-step">
        <div className="submit-step-num">{step.number}</div>
        <div><strong>{step.title}</strong><span>{step.description}</span></div>
      </div>
      {i < config.submitPage.steps.length - 1 && <div className="submit-step-line" />}
    </React.Fragment>
  ))}
</section>`);

app = app.replace(/<h3>Submission Guidelines<\/h3>/, `<h3>{config.submitPage.guidelinesTitle}</h3>`);
app = app.replace(/<ul className="submit-guidelines">[\s\S]*?<\/ul>/,
`<ul className="submit-guidelines">
  {config.submitPage.guidelines.map((g, i) => (
    <li key={i}><CheckCircle2 size={15} /> {g}</li>
  ))}
</ul>`);

app = app.replace(/<h3>Accepted Formats<\/h3>/, `<h3>{config.submitPage.formatsTitle}</h3>`);
app = app.replace(/<div className="format-tags">[\s\S]*?<\/div>/,
`<div className="format-tags">
  {config.submitPage.formats.map(f => <span className="format-tag" key={f}>{f}</span>)}
</div>`);

app = app.replace(/<h3 className="form-section-title">Your Details<\/h3>/, `<h3 className="form-section-title">{config.submitPage.formSectionTitle1}</h3>`);
app = app.replace(/<label htmlFor="sub-name">Full Name<\/label>/, `<label htmlFor="sub-name">{config.submitPage.formLabels.fullName}</label>`);
app = app.replace(/placeholder="e\.g\. Saanvi Agarwala"/, `placeholder={config.submitPage.formPlaceholders.fullName}`);
app = app.replace(/<label htmlFor="sub-email">Email Address<\/label>/, `<label htmlFor="sub-email">{config.submitPage.formLabels.email}</label>`);
app = app.replace(/placeholder="you@school\.edu"/, `placeholder={config.submitPage.formPlaceholders.email}`);

app = app.replace(/<h3 className="form-section-title">Article Details<\/h3>/, `<h3 className="form-section-title">{config.submitPage.formSectionTitle2}</h3>`);
app = app.replace(/<label htmlFor="sub-dept">Department<\/label>/, `<label htmlFor="sub-dept">{config.submitPage.formLabels.department}</label>`);
app = app.replace(/<option value="" disabled>Select a department<\/option>/, `<option value="" disabled>{config.submitPage.formPlaceholders.departmentDefault}</option>`);
app = app.replace(/departments\.map/g, `config.departments.map`);

app = app.replace(/<label htmlFor="sub-format">Format<\/label>/, `<label htmlFor="sub-format">{config.submitPage.formLabels.format}</label>`);
app = app.replace(/<option value="" disabled>Select a format<\/option>/, `<option value="" disabled>{config.submitPage.formPlaceholders.formatDefault}</option>`);

app = app.replace(/<label htmlFor="sub-title">Working Title<\/label>/, `<label htmlFor="sub-title">{config.submitPage.formLabels.workingTitle}</label>`);
app = app.replace(/placeholder="Give your article a clear, descriptive title"/, `placeholder={config.submitPage.formPlaceholders.workingTitle}`);

app = app.replace(/<label htmlFor="sub-pitch">Your Pitch<\/label>/, `<label htmlFor="sub-pitch">{config.submitPage.formLabels.pitch}</label>`);
app = app.replace(/placeholder="Describe your idea, argument, question, or creative concept\. What will this piece explore\? Why does it matter\?"/, `placeholder={config.submitPage.formPlaceholders.pitch}`);

app = app.replace(/<p className="form-note">By submitting, you confirm this is your original work and agree to AXIOM's editorial review process\.<\/p>/, `<p className="form-note">{config.submitPage.formNote}</p>`);
app = app.replace(/Submit to AXIOM <Send size=\{18\} \/>/, `{config.submitPage.submitButton} <Send size={18} />`);

app = app.replace(/<h3>Not sure where to start\?<\/h3>/, `<h3>{config.submitPage.bottomCtaHeading}</h3>`);
app = app.replace(/<p>Browse our journal for examples or explore departments to find the right fit\.<\/p>/, `<p>{config.submitPage.bottomCtaText}</p>`);
app = app.replace(/Browse Journal <BookOpen size=\{16\} \/>/, `{config.submitPage.bottomButton1} <BookOpen size={16} />`);
app = app.replace(/View Departments <Layers3 size=\{16\} \/>/, `{config.submitPage.bottomButton2} <Layers3 size={16} />`);

app = app.replace(/function ArticlePage\(\{ articleId \}: \{ articleId: string \}\) \{([\s\S]*?)const \{ go \} = useContext\(NavCtx\);/,
`function ArticlePage({ articleId }: { articleId: string }) {
  const { go } = useContext(NavCtx);
  const config = useSiteData();`);

app = app.replace(/const article = articles\.find\(a => a\.id === articleId\) \|\| articles\[0\];/, `const article = config.articles.find(a => a.id === articleId) || config.articles[0];`);
app = app.replace(/const d = deptFor\(article\.department\);/, `const d = article ? deptFor(config.departments, article.department) : config.departments[0];`);

app = app.replace(/export function App\(\) \{([\s\S]*?)const \[page, setPage\] = useState<Page>\("home"\);/,
`export function App() {
  const [config, setConfig] = useState<AxiomSiteData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: siteConfig },
          { data: arts },
          { data: depts },
          { data: team },
          { data: faqsData },
        ] = await Promise.all([
          supabase.from('site_config').select('*').eq('id', 1).single(),
          supabase.from('articles').select('*'),
          supabase.from('departments').select('*'),
          supabase.from('team_members').select('*'),
          supabase.from('faqs').select('*'),
        ]);

        if (siteConfig) {
          setConfig({
            siteSettings: siteConfig.site_settings,
            homePage: siteConfig.home_page,
            departmentsPage: siteConfig.departments_page,
            journalPage: siteConfig.journal_page,
            aboutPage: siteConfig.about_page,
            contactPage: siteConfig.contact_page,
            submitPage: siteConfig.submit_page,
            footer: siteConfig.footer,
            founder: siteConfig.founder,
            departments: depts || [],
            articles: arts || [],
            teamMembers: team || [],
          });
          // Update nested faqs if needed
          if (faqsData) {
            siteConfig.contact_page.faqs = faqsData;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const [page, setPage] = useState<Page>("home");`);

app = app.replace(/const \[activeDepartment, setActiveDepartment\] = useState<DepartmentName \| "All">\("All"\);/, `const [activeDepartment, setActiveDepartment] = useState<string | "All">("All");`);

app = app.replace(/const go = useCallback\(\(p: Page, opts\?: \{ articleId\?: string, department\?: DepartmentName \| "All" \}\) => \{/, `const go = useCallback((p: Page, opts?: { articleId?: string, department?: string | "All" }) => {`);

app = app.replace(/const \[loading, setLoading\] = useState\(true\);/, `const [loading, setLoading] = useState(true);\n  if (!config) return <Preloader onComplete={() => {}} />;\n`);

app = app.replace(/<NavCtx\.Provider value=\{\{ page, activeArticle, activeDepartment, go \}\}>/,
`<SiteCtx.Provider value={config}>\n      <NavCtx.Provider value={{ page, activeArticle, activeDepartment, go }}>`);

app = app.replace(/<\/NavCtx\.Provider>/, `</NavCtx.Provider>\n    </SiteCtx.Provider>`);


app = app.replace(/<p>A student-led intellectual journal fostering critical thinking, academic curiosity, and creative expression across disciplines\.<\/p>/, `<p>{config.footer.brandDescription}</p>`);
app = app.replace(/<h4>Quick Links<\/h4>/, `<h4>{config.footer.quickLinksHeading}</h4>`);
app = app.replace(/<h4>Departments<\/h4>/, `<h4>{config.footer.departmentsHeading}</h4>`);
app = app.replace(/<h4>Get Involved<\/h4>/, `<h4>{config.footer.getInvolvedHeading}</h4>`);
app = app.replace(/<p className="footer-col-desc">Have an idea worth publishing\? We accept student submissions on a rolling basis\.<\/p>/, `<p className="footer-col-desc">{config.footer.getInvolvedText}</p>`);
app = app.replace(/Submit Work <ArrowRight size=\{14\} \/>/, `{config.footer.getInvolvedButton} <ArrowRight size={14} />`);

app = app.replace(/<span>© 2026 AXIOM — Student Intellectual Journal\. All rights reserved\.<\/span>/, `<span>{config.footer.copyrightText}</span>`);
app = app.replace(/<span className="footer-credit">Built with purpose by students, for students\.<\/span>/, `<span className="footer-credit">{config.footer.creditLine}</span>`);


app = app.replace(/function Preloader\(\{ onComplete \}: \{ onComplete: \(\) => void \}\) \{([\s\S]*?)const \[stage, setStage\] = useState\(0\);/,
`function Preloader({ onComplete }: { onComplete: () => void }) {
  const config = useContext(SiteCtx);
  const [stage, setStage] = useState(0);`);

app = app.replace(/<span className="preloader-letter preloader-a">A<\/span>\s*<span className="preloader-letter preloader-x">X<\/span>/, 
`{config ? (
  <>
    <span className="preloader-letter preloader-a">{config.siteSettings.preloader.letter1}</span>
    <span className="preloader-letter preloader-x">{config.siteSettings.preloader.letter2}</span>
  </>
) : (
  <>
    <span className="preloader-letter preloader-a">A</span>
    <span className="preloader-letter preloader-x">X</span>
  </>
)}`);

app = app.replace(/function MarqueeText\(\) \{/,
`function MarqueeText() {
  const config = useSiteData();`);

app = app.replace(/<span>CRITICAL THINKING<\/span> <span className="marquee-dot">•<\/span>\s*<span>CREATIVE EXPRESSION<\/span> <span className="marquee-dot">•<\/span>\s*<span>ACADEMIC CURIOSITY<\/span> <span className="marquee-dot">•<\/span>\s*<span>INTELLECTUAL DISCOURSE<\/span> <span className="marquee-dot">•<\/span>/,
`{config.siteSettings.marquee.phrases.map((phrase, i) => (
  <React.Fragment key={i}>
    <span>{phrase}</span> <span className="marquee-dot">•</span>
  </React.Fragment>
))}`);


fs.writeFileSync('src/App.tsx', app);
