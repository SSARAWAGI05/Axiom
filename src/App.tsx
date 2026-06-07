import React, {
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  FileText,
  FlaskConical,
  Globe2,
  GraduationCap,
  Headphones,
  Heart,
  Landmark,
  Layers3,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  Palette,
  PenLine,
  Phone,
  Quote,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import * as THREE from "three";
import { supabase } from "./lib/supabase";
import type { AxiomSiteData, Department, Article, TeamMember, FAQ } from "./types";

function DynamicIcon({ name, size = 20 }: { name: string; size?: number }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.FileText;
  return <IconComponent size={size} />;
}

/* ─── Types ─── */
type Page = "home" | "departments" | "journal" | "about" | "contact" | "submit" | "article";


type Submission = { id: string; name: string; email: string; department: string; format: string; title: string; pitch: string };
/* ─── Data ─── */





const submissionKey = "axiom-single-page-submissions";
function deptFor(depts: Department[], n: string) { return depts.find(d => d.name === n) || depts[0]; }

/* ─── Team Data ─── */
/* ─── Navigation Context ─── */
const NavCtx = createContext<{ 
  page: Page; 
  activeArticle?: string; 
  activeDepartment?: string | "All";
  go: (p: Page, opts?: { articleId?: string, department?: string | "All" }) => void 
}>({ page: "home", go: () => {} });

const SiteCtx = createContext<AxiomSiteData | null>(null);
export function useSiteData() { return useContext(SiteCtx)!; }


/* ─── Reveal Hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.classList.add("reveal");
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Three.js Scene (optimized) ─── */
function AxiomScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 8.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const group = new THREE.Group(); scene.add(group);
    const coreGeo = new THREE.IcosahedronGeometry(1.55, 2);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x4d8ce8, roughness: 0.3, metalness: 0.35, emissive: 0x2563eb, emissiveIntensity: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat); group.add(core);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.72, 1), new THREE.MeshBasicMaterial({ color: 0x7C6FEB, wireframe: true, transparent: true, opacity: 0.35 }));
    group.add(wire);
    const orbMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.28 });
    [2.25, 2.9, 3.55].forEach((r, i) => {
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 160; j++) { const a = (j / 160) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); }
      const orb = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbMat);
      orb.rotation.x = Math.PI / (i + 3); orb.rotation.y = Math.PI / (i + 4); group.add(orb);
    });
    const nGeo = new THREE.SphereGeometry(0.085, 14, 14);
    const nMats = [0x34d399, 0x60a5fa, 0xa78bfa, 0x22d3ee, 0xf472b6].map(c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.45, roughness: 0.3 }));
    for (let i = 0; i < 34; i++) { const n = new THREE.Mesh(nGeo, nMats[i % nMats.length]); const t = i * 1.618, y = 1 - (i / 33) * 2, rad = Math.sqrt(1 - y * y) * 3.15; n.position.set(Math.cos(t) * rad, y * 2.2, Math.sin(t) * rad); group.add(n); }
    scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    const kl = new THREE.PointLight(0x60a5fa, 3.4, 18); kl.position.set(3.8, 4.2, 5.2); scene.add(kl);
    const fl = new THREE.PointLight(0xa78bfa, 2.2, 16); fl.position.set(-4, -2.8, 4); scene.add(fl);
    let frame = 0, pX = 0, pY = 0;
    const resize = () => { const w = mount.clientWidth || 640, h = mount.clientHeight || 520; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
    const onPtr = (e: PointerEvent) => { const r = mount.getBoundingClientRect(); pX = ((e.clientX - r.left) / r.width - 0.5) * 0.6; pY = ((e.clientY - r.top) / r.height - 0.5) * 0.6; };
    const anim = () => { frame = requestAnimationFrame(anim); group.rotation.y += 0.006 + pX * 0.006; group.rotation.x += 0.002 + pY * 0.004; core.rotation.x += 0.004; wire.rotation.y -= 0.006; renderer.render(scene, camera); };
    resize(); anim(); window.addEventListener("resize", resize); mount.addEventListener("pointermove", onPtr);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); mount.removeEventListener("pointermove", onPtr); renderer.dispose(); coreGeo.dispose(); coreMat.dispose(); nGeo.dispose(); nMats.forEach(m => m.dispose()); orbMat.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div className="axiom-scene" ref={mountRef} />;
}

/* ─── Page Transition Wrapper ─── */
function PageTransition({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShow(true));
    });
    if (wrapRef.current) wrapRef.current.scrollTop = 0;
    return () => cancelAnimationFrame(t);
  }, [pageKey]);

  return (
    <div ref={wrapRef} className={`page-wrap ${show ? "page-enter-active" : "page-enter"}`} key={pageKey}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGES
   ═══════════════════════════════════════════ */

/* ── HOME ── */
function HomePage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const r1 = useReveal(); const r2 = useReveal(); const r3 = useReveal();

  return (
    <div className="page page-home">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><GraduationCap size={16} /> {config.homePage.eyebrow}</span>
          <h1>{config.homePage.heroTitle}</h1>
          <p className="hero-subtitle">{config.homePage.heroSubtitle}</p>
          <p className="hero-desc">{config.homePage.heroDescription}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => go("journal")}>
              {config.homePage.heroButton1} <ArrowRight size={18} />
            </button>
            <button className="btn btn-ghost" onClick={() => go("submit")}>
              {config.homePage.heroButton2} <PenLine size={18} />
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <AxiomScene />
        </div>
      </section>

      {/* Stats bar */}
      <div className="stats-bar" ref={r1}>
  {config.homePage.stats.map((s, i) => (
    <div className="stat" key={i}><strong>{s.value}</strong><span>{s.label}</span></div>
  ))}
</div>

      {/* Quick cards */}
      <section className="home-cards" ref={r2}>
        <h2 className="section-title">{config.homePage.actionSectionTitle}</h2>
        <p className="section-sub">{config.homePage.actionSectionSubtitle}</p>
        <div className="card-trio">
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
      {/* Featured departments preview */}
      <section className="home-dept-preview" ref={r3}>
        <h2 className="section-title">{config.homePage.deptPreviewTitle}</h2>
        <p className="section-sub">{config.homePage.deptPreviewSubtitle}</p>
        <div className="dept-preview-grid">
          {config.departments.slice(0, 4).map((d, i) => (
            <div className={`dept-mini stagger-${i + 1}`} key={d.name} style={{ "--accent": d.color, cursor: "pointer" } as React.CSSProperties} onClick={() => go("journal", { department: d.name })}>
              <div className="dept-mini-icon"><DynamicIcon name={d.icon as string} size={24} /></div>
              <strong>{d.name}</strong>
              <span>{d.domain}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => go("departments")}>
          {config.homePage.deptPreviewButton} <ArrowRight size={16} />
        </button>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="cta-glow" />
        <h2>{config.homePage.ctaHeading}</h2>
        <p>{config.homePage.ctaText}</p>
        <button className="btn btn-primary" onClick={() => go("submit")}>
          {config.homePage.ctaButton} <PenLine size={18} />
        </button>
      </section>
    </div>
  );
}

/* ── DEPARTMENTS ── */
function DepartmentsPage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const r1 = useReveal();
  return (
    <div className="page page-departments">
      <header className="page-header">
        <span className="eyebrow"><Layers3 size={16} /> {config.departmentsPage.eyebrow}</span>
        <h1>{config.departmentsPage.title}</h1>
        <p>{config.departmentsPage.description}</p>
      </header>
      <section className="dept-grid" ref={r1}>
        {config.departments.map((d, i) => (
          <article className={`dept-card stagger-${i + 1}`} key={d.name} style={{ "--accent": d.color, cursor: "pointer" } as React.CSSProperties} onClick={() => go("journal", { department: d.name })}>
            <div className="dept-card-head">
              <div className="dept-card-icon"><DynamicIcon name={d.icon as string} size={32} /></div>
              <h3>{d.name}</h3>
            </div>
            <span className="dept-card-domain">{d.domain}</span>
            <p>{d.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

/* ── JOURNAL ── */
function JournalPage({ initialDept }: { initialDept: string | "All" }) {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const formats = ["Research Article", "Opinion Piece", "Interview", "Analysis", "Creative Writing"];
  const [query, setQuery] = useState("");
  const [activeDept, setActiveDept] = useState<string | "All">(initialDept);
  useEffect(() => { setActiveDept(initialDept); }, [initialDept]);
  const [fmtFilter, setFmtFilter] = useState<string | "All">("All");
  const visible = useMemo(() => {
    const n = query.toLowerCase();
    return config.articles.filter(a => {
      const h = `${a.title} ${a.department} ${a.format} ${a.summary}`.toLowerCase();
      return h.includes(n) && (activeDept === "All" || a.department === activeDept) && (fmtFilter === "All" || a.format === fmtFilter);
    });
  }, [activeDept, fmtFilter, query]);

  const r2 = useReveal();

  return (
    <div className="page page-journal">
      <header className="page-header">
        <span className="eyebrow"><BookOpen size={16} /> {config.journalPage.eyebrow}</span>
        <h1>{config.journalPage.title}</h1>
        <p>{config.journalPage.description}</p>
      </header>

      {/* Filters */}
      <section className="journal-filters" ref={r2}>
        <div className="journal-search-row">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={config.journalPage.searchPlaceholder} />
          </label>
          <div className="journal-result-count">{visible.length} article{visible.length !== 1 ? "s" : ""}</div>
        </div>

        <div className="filter-section">
          <span className="filter-label">{config.journalPage.filterDepartmentLabel}</span>
          <div className="dept-chips">
            <button className={`dept-chip ${activeDept === "All" ? "active" : ""}`} onClick={() => setActiveDept("All")}>{config.journalPage.allDepartmentsLabel}</button>
            {config.departments.map(d => (
              <button key={d.name} className={`dept-chip ${activeDept === d.name ? "active" : ""}`} style={{ "--accent": d.color } as React.CSSProperties} onClick={() => setActiveDept(d.name)}>
                <DynamicIcon name={d.icon as string} size={16} /> {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-label">{config.journalPage.filterFormatLabel}</span>
          <div className="fmt-pills">
            <button className={`fmt-pill ${fmtFilter === "All" ? "active" : ""}`} onClick={() => setFmtFilter("All")}>{config.journalPage.allFormatsLabel}</button>
            {formats.map(f => (
              <button key={f} className={`fmt-pill ${fmtFilter === f ? "active" : ""}`} onClick={() => setFmtFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="article-grid">
        {visible.length === 0 && (
          <div className="empty-state">
            <Search size={32} />
            <h3>{config.journalPage.emptyStateHeading}</h3>
            <p>{config.journalPage.emptyStateText}</p>
            <MagneticButton className="btn btn-ghost" onClick={() => { setQuery(""); setActiveDept("All"); setFmtFilter("All"); }}>{config.journalPage.emptyStateButton}</MagneticButton>
          </div>
        )}
        {visible.map((a, i) => {
          const d = deptFor(config.departments, a.department);
          return (
            <article className={`article-card stagger-${i + 1}`} key={a.id} style={{ "--accent": d.color, cursor: "pointer" } as React.CSSProperties} onClick={() => go("article", { articleId: a.id })}>
              <div className="article-accent" />
              <div className="article-body">
                <div className="article-tags">
                  <span className="article-dept-tag"><DynamicIcon name={d.icon as string} size={14} /> {a.department}</span>
                  <span className="article-fmt-tag">{a.format}</span>
                </div>
                <h3>{a.title}</h3>
                <p>{a.summary}</p>
                <div className="article-author-row">
                  <div className="article-author-avatar"><Users size={11} /></div>
                  <span>By <strong className="article-author-name">{a.author}</strong></span>
                </div>
                <footer>
                  <span className="article-read-time"><BookOpen size={13} /> {a.readTime}</span>
                  <button className="article-view-btn" onClick={(e) => { e.stopPropagation(); go("article", { articleId: a.id }); }}>
                    Read Article <ArrowRight size={13} />
                  </button>
                </footer>
              </div>
            </article>
          );
        })}
      </section>

      {/* CTA */}
      <section className="journal-cta">
        <h3>{config.journalPage.ctaHeading}</h3>
        <p>{config.journalPage.ctaText}</p>
        <MagneticButton className="btn btn-primary" onClick={() => go("submit")}>{config.journalPage.ctaButton} <PenLine size={16} /></MagneticButton>
      </section>
    </div>
  );
}

/* ── ABOUT ── */
function AboutPage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const r1 = useReveal(); const r2 = useReveal(); const r3 = useReveal(); const r4 = useReveal();
  const [teamIdx, setTeamIdx] = useState(0);
  const visibleCount = 3;
  const canPrev = teamIdx > 0;
  const canNext = teamIdx + visibleCount < config.teamMembers.length;

  return (
    <div className="page page-about">
      <header className="page-header">
        <span className="eyebrow"><Users size={16} /> {config.aboutPage.eyebrow}</span>
        <h1>{config.aboutPage.title}</h1>
        <p>{config.aboutPage.description}</p>
      </header>

      {/* Mission & Vision */}
      <section className="about-mission" ref={r1}>
        <div className="mission-card">
          <div className="mission-icon"><Award size={28} /></div>
          <h3>{config.aboutPage.missionTitle}</h3><p>{config.aboutPage.missionText}</p>
        </div>
        <div className="mission-card">
          <div className="mission-icon"><GraduationCap size={28} /></div>
          <h3>{config.aboutPage.visionTitle}</h3><p>{config.aboutPage.visionText}</p>
        </div>
        <div className="mission-card">
          <div className="mission-icon"><Heart size={28} /></div>
          <h3>{config.aboutPage.valuesTitle}</h3><p>{config.aboutPage.valuesText}</p>
        </div>
      </section>

      <MarqueeText />

      {/* Founder Spotlight */}
      <section className="founder-section" ref={r2}>
        <h2 className="section-title">{config.aboutPage.founderSectionTitle}</h2>
        <div className="founder-card">
          <div className="founder-photo">
            <img src={config.founder.photo} alt={config.founder.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="founder-photo-placeholder"><GraduationCap size={48} /></div>
          </div>
          <div className="founder-info">
            <h3>{config.founder.name}</h3>
            <span className="founder-role">{config.founder.role}</span>
            <p>{config.founder.bio}</p>
          </div>
        </div>
      </section>

      {/* Team Carousel */}
      <section className="team-section" ref={r3}>
        <div className="team-header">
          <div>
            <h2 className="section-title">{config.aboutPage.teamSectionTitle}</h2>
            <p className="section-sub">{config.aboutPage.teamSectionSubtitle}</p>
          </div>
          <div className="carousel-nav">
            <button className="carousel-btn" disabled={!canPrev} onClick={() => setTeamIdx(i => i - 1)}><ChevronLeft size={20} /></button>
            <button className="carousel-btn" disabled={!canNext} onClick={() => setTeamIdx(i => i + 1)}><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="team-carousel">
          <div className="team-track" style={{ transform: `translateX(-${teamIdx * (100 / visibleCount)}%)` }}>
            {config.teamMembers.map((m, i) => (
              <div className="team-card" key={i}>
                <div className="team-photo">
                  <img src={m.photo} alt={m.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="team-photo-placeholder"><Users size={32} /></div>
                </div>
                <strong>{m.name}</strong>
                <span>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="about-workflow" ref={r4}>
        <h2 className="section-title">{config.aboutPage.workflowSectionTitle}</h2>
        <p className="section-sub">{config.aboutPage.workflowSectionSubtitle}</p>
        <div className="workflow">
          {config.aboutPage.workflowSteps.map((step, i) => {
  const num = step.number; const title = step.title; const text = step.description; return (
            <article className={`workflow-step stagger-${i + 1}`} key={title}>
              <span className="step-num">{num}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          );
        })}
        </div>
      </section>

      <section className="about-cta">
        <h2>{config.aboutPage.ctaHeading}</h2>
        <p>{config.aboutPage.ctaText}</p>
        <div className="about-cta-btns">
          <MagneticButton className="btn btn-primary" onClick={() => go("submit")}>{config.aboutPage.ctaButton1} <Send size={18} /></MagneticButton>
          <MagneticButton className="btn btn-ghost" onClick={() => go("contact")}>{config.aboutPage.ctaButton2} <Mail size={18} /></MagneticButton>
        </div>
      </section>
    </div>
  );
}

/* ── CONTACT ── */
function ContactPage() {
  const config = useSiteData();
  const r1 = useReveal(); const r2 = useReveal();
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
  }

  return (
    <div className="page page-contact">
      <header className="page-header">
        <span className="eyebrow"><Mail size={16} /> {config.contactPage.eyebrow}</span>
        <h1>{config.contactPage.title}</h1>
        <p>{config.contactPage.description}</p>
      </header>

      <section className="contact-layout" ref={r1}>
        <div className="contact-info">
          <h2 className="section-title">{config.contactPage.reachOutTitle}</h2>
          <p className="section-sub">{config.contactPage.reachOutSubtitle}</p>
          <div className="contact-cards">
            <div className="contact-item"><div className="contact-item-icon"><Mail size={20} /></div><div><strong>Email</strong><span>{config.contactPage.contactInfo.email}</span></div></div>
            <div className="contact-item"><div className="contact-item-icon"><MapPin size={20} /></div><div><strong>Location</strong><span>{config.contactPage.contactInfo.location}</span></div></div>
            <div className="contact-item"><div className="contact-item-icon"><MessageCircle size={20} /></div><div><strong>Instagram</strong><span>{config.contactPage.contactInfo.instagram}</span></div></div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {sent && <div className="form-success"><CheckCircle2 size={20} /> {config.contactPage.formSuccessMessage}</div>}
          <input name="name" placeholder="Your name" required />
          <input name="email" type="email" placeholder="Email address" required />
          <input name="subject" placeholder="Subject" required />
          <textarea name="message" placeholder="Your message..." required />
          <MagneticButton className="btn btn-primary" type="submit">{config.contactPage.sendButtonText} <Send size={18} /></MagneticButton>
        </form>
      </section>

      {/* FAQ */}
      <section className="faq-section" ref={r2}>
        <h2 className="section-title">{config.contactPage.faqSectionTitle}</h2>
        <div className="faq-grid">
  {config.contactPage.faqs.map((faq, i) => (
    <div className="faq-item" key={i}><h3>{faq.question}</h3><p>{faq.answer}</p></div>
  ))}
</div>
</section>
    </div>
  );
}
/* ── SUBMIT ── */
function SubmitPage() {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const s = localStorage.getItem(submissionKey); return s ? JSON.parse(s) : [];
  });
  useEffect(() => { localStorage.setItem(submissionKey, JSON.stringify(submissions)); }, [submissions]);
  const [submitted, setSubmitted] = useState(false);
  const formats = ["Research Article", "Opinion Piece", "Interview", "Analysis", "Creative Writing"];
  
  // Tracking State
  const [mode, setMode] = useState<"submit" | "track">("submit");
  const [trackingEmail, setTrackingEmail] = useState("");
  const [trackedSubmissions, setTrackedSubmissions] = useState<any[] | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  
  // Rich Text State
  const [articleContent, setArticleContent] = useState("");

  async function submitWork(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sub = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      department: String(fd.get("department")),
      format: String(fd.get("format")),
      title: String(fd.get("title")),
      pitch: String(fd.get("pitch")),
      content: String(fd.get("content"))
    };
    try {
      await supabase.from('article_submissions').insert([sub]);
      setSubmissions(prev => [{ id: `s-${Date.now()}`, ...sub }, ...prev]);
      e.currentTarget.reset();
      setArticleContent("");
      setSubmitted(true);
    } catch(err) {
      console.error(err);
    }
  }

  async function trackStatus(e: React.FormEvent) {
    e.preventDefault();
    setTrackingLoading(true);
    try {
      const { data, error } = await supabase.from('article_submissions').select('*').ilike('email', trackingEmail.trim()).order('created_at', { ascending: false });
      if (error) throw error;
      setTrackedSubmissions(data || []);
    } catch(err) {
      console.error(err);
      alert("Error fetching submissions. Please check your connection.");
    } finally {
      setTrackingLoading(false);
    }
  }

  const r1 = useReveal(); const r2 = useReveal();
  return (
    <div className="page page-submit">
      <header className="page-header">
        <span className="eyebrow"><PenLine size={16} /> {config.submitPage.eyebrow}</span>
        <h1>{config.submitPage.title}</h1>
        <p>{config.submitPage.description}</p>
      </header>

      {/* How it works */}
      <section className="submit-steps" ref={r1}>
  {config.submitPage.steps.map((step, i) => (
    <React.Fragment key={i}>
      <div className="submit-step">
        <div className="submit-step-num">{step.number}</div>
        <div><strong>{step.title}</strong><span>{step.description}</span></div>
      </div>
      {i < config.submitPage.steps.length - 1 && <div className="submit-step-line" />}
    </React.Fragment>
  ))}
</section>

      <section className="submit-main" ref={r2}>
        <aside className="submit-sidebar">
          <div className="submit-guide-card">
            <div className="submit-guide-icon"><FileText size={24} /></div>
            <h3>{config.submitPage.guidelinesTitle}</h3>
            <ul className="submit-guidelines">
              {config.submitPage.guidelines.map((g, i) => (
                <li key={i}><CheckCircle2 size={15} /> {g}</li>
              ))}
            </ul>
          </div>
          <div className="submit-formats-card">
            <h3>{config.submitPage.formatsTitle}</h3>
            <div className="format-tags">
              {config.submitPage.formats.map(f => <span className="format-tag" key={f}>{f}</span>)}
            </div>
          </div>
          
          <div className="submit-faq-card" style={{ padding: '24px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '20px', boxShadow: 'var(--shadow)', marginTop: '16px' }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.05rem', marginBottom: '16px' }}>Submission FAQs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '0.9rem', marginBottom: '4px' }}>How long does review take?</strong>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>Our editorial team typically reviews pitches and drafts within 3 to 5 business days.</p>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '0.9rem', marginBottom: '4px' }}>Can I submit a draft?</strong>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>Yes, full drafts are highly preferred over just pitches as it allows us to gauge your writing style.</p>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '0.9rem', marginBottom: '4px' }}>Do you accept reprints?</strong>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>No, we strictly look for original pieces that have not been published elsewhere.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="submit-form-wrapper">
          <div className="submit-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
            <button className={`btn ${mode === 'submit' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('submit')}>Submit an Article</button>
            <button className={`btn ${mode === 'track' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('track')}>Track Status</button>
          </div>

          {mode === 'submit' ? (
            <>
              {submitted && <div className="form-success"><CheckCircle2 size={20} /> Your submission has been received! Our editorial team will review it shortly.</div>}
              <form className="submit-form" onSubmit={submitWork}>
                <h3 className="form-section-title">{config.submitPage.formSectionTitle1}</h3>
                <div className="form-row">
                  <div className="form-group"><label htmlFor="sub-name">{config.submitPage.formLabels.fullName}</label><input id="sub-name" name="name" placeholder={config.submitPage.formPlaceholders.fullName} required /></div>
                  <div className="form-group"><label htmlFor="sub-email">{config.submitPage.formLabels.email}</label><input id="sub-email" name="email" type="email" placeholder={config.submitPage.formPlaceholders.email} required /></div>
                </div>
                <h3 className="form-section-title">{config.submitPage.formSectionTitle2}</h3>
                <div className="form-row">
                  <div className="form-group"><label htmlFor="sub-dept">{config.submitPage.formLabels.department}</label><select id="sub-dept" name="department" required defaultValue="">{<option value="" disabled>{config.submitPage.formPlaceholders.departmentDefault}</option>}{config.departments.map(d => <option key={d.name} value={d.name}>{d.name} — {d.domain}</option>)}</select></div>
                  <div className="form-group"><label htmlFor="sub-format">{config.submitPage.formLabels.format}</label><select id="sub-format" name="format" required defaultValue=""><option value="" disabled>{config.submitPage.formPlaceholders.formatDefault}</option>{formats.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                </div>
                <div className="form-group full"><label htmlFor="sub-title">{config.submitPage.formLabels.workingTitle}</label><input id="sub-title" name="title" placeholder={config.submitPage.formPlaceholders.workingTitle} required /></div>
                <div className="form-group full"><label htmlFor="sub-pitch">{config.submitPage.formLabels.pitch}</label><textarea id="sub-pitch" name="pitch" placeholder={config.submitPage.formPlaceholders.pitch} required /></div>
                <div className="form-group full"><label htmlFor="sub-content">{config.submitPage.formLabels.articleContent || "Full Article Text"}</label>
                  <input type="hidden" name="content" value={articleContent} />
                  <ReactQuill theme="snow" value={articleContent} onChange={setArticleContent} placeholder={config.submitPage.formPlaceholders.articleContent || "Write your complete article content here..."} style={{ minHeight: "300px", border: '1px solid var(--line)', borderRadius: '14px', background: 'var(--bg)', overflow: 'hidden' }} />
                </div>
                <div className="form-footer">
                  <p className="form-note">{config.submitPage.formNote}</p>
                  <MagneticButton className="btn btn-primary" type="submit">{config.submitPage.submitButton} <Send size={18} /></MagneticButton>
                </div>
              </form>
            </>
          ) : (
            <div className="tracker-wrapper" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', background: 'var(--blue-pale)', color: 'var(--blue)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Search size={28} /></div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '8px', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>Track Your Submission</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Enter the email address you used to submit your article to securely view its editorial status.</p>
              </div>

              <form onSubmit={trackStatus} style={{ display: 'flex', gap: '12px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                <input type="email" value={trackingEmail} onChange={e => setTrackingEmail(e.target.value)} placeholder="name@example.com" required style={{ flex: 1, padding: '14px 20px', fontSize: '1rem', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', outline: 'none' }} />
                <MagneticButton className="btn btn-primary" type="submit" disabled={trackingLoading} style={{ padding: '0 24px', borderRadius: '12px' }}>
                  {trackingLoading ? "..." : "Track"} <ArrowRight size={16} />
                </MagneticButton>
              </form>

              {trackedSubmissions && (
                <div className="tracked-results" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--line)', paddingTop: '32px' }}>
                  {trackedSubmissions.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '16px', border: '1px dashed var(--line)' }}>
                      <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>No submissions found</p>
                      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>We couldn't find any articles submitted under <strong>{trackingEmail}</strong>.</p>
                    </div>
                  ) : (
                    trackedSubmissions.map((sub: any) => (
                      <div key={sub.id} style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: sub.status === 'accepted' ? 'var(--green)' : sub.status === 'rejected' ? 'var(--red)' : 'var(--blue)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ paddingRight: '16px' }}>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--navy)', fontFamily: '"Space Grotesk", sans-serif' }}>{sub.title}</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', gap: '12px' }}>
                              <span><Layers3 size={12} style={{ display: 'inline', marginRight: '4px' }}/> {sub.department}</span>
                              <span><PenLine size={12} style={{ display: 'inline', marginRight: '4px' }}/> {sub.format}</span>
                            </div>
                          </div>
                          <span style={{ 
                            padding: '6px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                            background: sub.status === 'accepted' ? '#dcfce7' : sub.status === 'rejected' ? '#fee2e2' : '#eff6ff',
                            color: sub.status === 'accepted' ? '#166534' : sub.status === 'rejected' ? '#991b1b' : '#1e3a8a',
                            border: `1px solid ${sub.status === 'accepted' ? 'rgba(22,101,52,0.1)' : sub.status === 'rejected' ? 'rgba(153,27,27,0.1)' : 'rgba(30,58,138,0.1)'}`
                          }}>
                            {sub.status}
                          </span>
                        </div>
                        {sub.feedback && (
                          <div style={{ padding: '16px', background: 'var(--blue-pale)', borderRadius: '12px', fontSize: '0.95rem', color: 'var(--navy)', border: '1px solid rgba(37,99,235,0.1)' }}>
                            <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--blue)', marginBottom: '6px' }}>Editor's Note</strong>
                            {sub.feedback}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="submit-bottom-cta">
        <h3>{config.submitPage.bottomCtaHeading}</h3>
        <p>{config.submitPage.bottomCtaText}</p>
        <div className="submit-bottom-btns">
          <MagneticButton className="btn btn-ghost" onClick={() => go("journal")}>{config.submitPage.bottomButton1} <BookOpen size={16} /></MagneticButton>
          <MagneticButton className="btn btn-ghost" onClick={() => go("departments")}>{config.submitPage.bottomButton2} <Layers3 size={16} /></MagneticButton>
        </div>
      </section>
    </div>
  );
}

/* ── MAGNETIC BUTTON ── */
function MagneticButton({ children, className, onClick, ...props }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-button ${className || ""}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onClick={onClick}
      {...props}
    >
      <div className="magnetic-content" style={{ transform: `translate(${position.x * 0.3}px, ${position.y * 0.3}px)`, transition: position.x === 0 ? "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none" }}>
        {children}
      </div>
    </button>
  );
}

/* ── ARTICLE PAGE ── */
function ArticlePage({ articleId }: { articleId: string }) {
  const { go } = useContext(NavCtx);
  const config = useSiteData();
  const article = config.articles.find(a => a.id === articleId) || config.articles[0];
  const d = article ? deptFor(config.departments, article.department) : config.departments[0];
  const [progress, setProgress] = useState(0);
  
  // Engagement State
  const [claps, setClaps] = useState(article?.claps || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  useEffect(() => {
    if (!article) return;
    async function loadEngagement() {
      // Fetch latest claps
      const { data: artData } = await supabase.from('articles').select('claps').eq('id', article.id).single();
      if (artData && artData.claps !== undefined) setClaps(artData.claps);
      
      // Fetch comments
      const { data: commentsData } = await supabase.from('article_comments').select('*').eq('article_id', article.id).order('created_at', { ascending: true });
      if (commentsData) setComments(commentsData);
      setLoadingComments(false);
    }
    loadEngagement();
  }, [article?.id]);

  async function handleClap() {
    setClaps(prev => prev + 1); // Optimistic update
    await supabase.rpc('increment_claps', { row_id: article.id });
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    const newComment = { article_id: article.id, author_name: commentName, content: commentText };
    const { data, error } = await supabase.from('article_comments').insert([newComment]).select();
    if (!error && data) {
      setComments(prev => [...prev, data[0]]);
      setCommentText("");
    }
  }

  useEffect(() => {
    const updateProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(winHeightPx > 0 ? (scrollPx / winHeightPx) * 100 : 0);
    };
    window.addEventListener("scroll", updateProgress);
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="page page-article">
      <div className="reading-progress-bar" style={{ width: `${progress}%`, background: d.color }} />
      
      <header className="article-hero" style={{ "--accent": d.color } as React.CSSProperties}>
        <button className="btn btn-ghost back-btn" onClick={() => go("journal")}><ArrowLeft size={16} /> Back to Journal</button>
        <div className="article-hero-tags">
          <span className="article-dept-tag"><DynamicIcon name={d.icon as string} size={14} /> {article.department}</span>
          <span className="article-fmt-tag">{article.format}</span>
        </div>
        <h1>{article.title}</h1>
        <div className="article-hero-meta">
          <div className="meta-author">
            <div className="author-avatar"><Users size={16}/></div>
            <div><strong>{article.author}</strong><span>AXIOM Contributor</span></div>
          </div>
          <div className="meta-stats">
            <span><BookOpen size={16}/> {article.readTime}</span>
          </div>
        </div>
      </header>

      <div className="article-layout">
        <article className="article-content" style={{ "--accent": d.color } as React.CSSProperties}>
          <div className="article-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--line)' }}>
            <button onClick={handleClap} className="action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '99px', background: 'var(--blue-pale)', border: '1px solid rgba(37,99,235,0.15)', color: 'var(--blue)', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s' }}>
              <Heart size={20} color={claps > 0 ? "var(--pink)" : "currentColor"} fill={claps > 0 ? "var(--pink)" : "none"} />
              {claps}
            </button>
            <button onClick={() => setShowCommentsModal(true)} className="action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '99px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--navy)', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s' }}>
              <MessageCircle size={20} />
              {comments.length}
            </button>
          </div>
          
          <p className="lead">{article.summary}</p>
          
          <div className="article-body-text" dangerouslySetInnerHTML={{ __html: article.content || "This article has no content yet." }} />

          {/* Comments Modal Overlay */}
          {showCommentsModal && (
            <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowCommentsModal(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '20px' }}>
              <div className="modal-content" style={{ background: 'var(--card)', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', borderRadius: '24px', padding: '32px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', position: 'relative', animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <button onClick={() => setShowCommentsModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--bg)', border: '1px solid var(--line)', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
                  <X size={18} />
                </button>
                
                <h3 style={{ fontSize: '1.4rem', color: 'var(--navy)', fontFamily: '"Space Grotesk", sans-serif', margin: '0 0 24px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={20} color="var(--blue)" /> Discussion ({comments.length})
                </h3>
                
                <form onSubmit={handleCommentSubmit} style={{ display: 'grid', gap: '16px', marginBottom: '40px', background: 'var(--bg)', padding: '24px', borderRadius: '20px', border: '1px solid var(--line)' }}>
                  <input type="text" placeholder="Your Name" value={commentName} onChange={e => setCommentName(e.target.value)} required style={{ padding: '14px 18px', background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', outline: 'none', fontSize: '0.95rem', color: 'var(--navy)' }} />
                  <textarea placeholder="Share your thoughts..." value={commentText} onChange={e => setCommentText(e.target.value)} required style={{ padding: '14px 18px', background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', outline: 'none', minHeight: '100px', resize: 'vertical', fontSize: '0.95rem', color: 'var(--navy)' }} />
                  <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '12px 28px', fontSize: '0.95rem', borderRadius: '12px' }}>Post Comment</button>
                </form>
                
                <div className="comments-list" style={{ display: 'grid', gap: '24px' }}>
                  {!loadingComments && comments.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px 20px', background: 'var(--bg)', borderRadius: '16px', border: '1px dashed var(--line)', fontSize: '0.95rem' }}>No comments yet. Be the first to start the conversation!</p>}
                  {comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '16px', padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--lavender))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '1.05rem', boxShadow: 'var(--shadow)' }}>
                        {c.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <strong style={{ color: 'var(--navy)', fontSize: '1rem' }}>{c.author_name}</strong>
                          <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════ */
const pages: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "departments", label: "Departments" },
  { id: "journal", label: "Journal" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "submit", label: "Submit" },
];

/* ── PRELOADER ── */
function Preloader({ onComplete }: { onComplete: () => void }) {
  const config = useContext(SiteCtx);
  const [stage, setStage] = useState(0); // 0 = draw logo, 1 = fade/slide out
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1800);
    const t2 = setTimeout(() => onComplete(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className={`preloader ${stage === 1 ? "exit" : ""}`}>
      <div className="preloader-content">
        <div className="preloader-logo-wrapper">
          {config ? (
  <>
    <span className="preloader-letter preloader-a">{config.siteSettings.preloader.letter1}</span>
    <span className="preloader-letter preloader-x">{config.siteSettings.preloader.letter2}</span>
  </>
) : (
  <>
    <span className="preloader-letter preloader-a">A</span>
    <span className="preloader-letter preloader-x">X</span>
  </>
)}
        </div>
        <div className="preloader-line"></div>
      </div>
    </div>
  );
}

/* ── MARQUEE ── */
function MarqueeText() {
  const config = useSiteData();
  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="marquee-content">
            {config.siteSettings.marquee.phrases.map((phrase, i) => (
  <React.Fragment key={i}>
    <span>{phrase}</span> <span className="marquee-dot">•</span>
  </React.Fragment>
))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
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
          // Update nested faqs if needed
          if (faqsData) {
            siteConfig.contact_page.faqs = faqsData;
          }
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
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const [page, setPage] = useState<Page>("home");
  const [activeArticle, setActiveArticle] = useState<string | undefined>();
  const [activeDepartment, setActiveDepartment] = useState<string | "All">("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("axiom-theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("axiom-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === "light" ? "dark" : "light");
  }, []);

  const go = useCallback((p: Page, opts?: { articleId?: string, department?: string | "All" }) => {
    setMenuOpen(false);
    setPage(p);
    if (opts?.articleId) setActiveArticle(opts.articleId);
    if (opts?.department) setActiveDepartment(opts.department);
    else if (p === "journal") setActiveDepartment("All");
    window.scrollTo({ top: 0 });
  }, []);

  const pageContent = useMemo(() => {
    switch (page) {
      case "home": return <HomePage />;
      case "departments": return <DepartmentsPage />;
      case "journal": return <JournalPage initialDept={activeDepartment} />;
      case "about": return <AboutPage />;
      case "contact": return <ContactPage />;
      case "submit": return <SubmitPage />;
      case "article": return <ArticlePage articleId={activeArticle!} />;
    }
  }, [page, activeArticle, activeDepartment]);

  const [loading, setLoading] = useState(true);
  if (!config) return <Preloader onComplete={() => {}} />;


  return (
    <SiteCtx.Provider value={config}>
      <NavCtx.Provider value={{ page, activeArticle, activeDepartment, go }}>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <div className="app">
        <header className="topbar">
          <button className="brand" onClick={() => go("home")} aria-label="Home">
            <strong>{config.siteSettings.siteName}</strong>
          </button>
          
          <div className="nav-sep"></div>

          <nav className={`nav ${menuOpen ? "open" : ""}`}>
            {pages.map(p => (
              <button key={p.id} className={`nav-link ${page === p.id ? "active" : ""} ${p.id === "submit" ? "nav-submit" : ""}`} onClick={() => { setMenuOpen(false); go(p.id); }}>
                {p.label}
              </button>
            ))}
          </nav>
          <button className="menu-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <main className="main-content">
          <PageTransition pageKey={page}>
            {pageContent}
          </PageTransition>
        </main>

        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-col footer-about">
              <div className="footer-brand">
                <span className="brand-mark small">A</span>
                <strong>AXIOM</strong>
              </div>
              <p>{config.footer.brandDescription}</p>
              <div className="footer-socials">
                <a href="#" className="footer-social" aria-label="Instagram"><MessageCircle size={18} /></a>
                <a href="#" className="footer-social" aria-label="Email"><Mail size={18} /></a>
                <a href="#" className="footer-social" aria-label="Globe"><Globe2 size={18} /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>{config.footer.quickLinksHeading}</h4>
              <div className="footer-links">
                {pages.map(p => <button key={p.id} onClick={() => go(p.id)}>{p.label}</button>)}
              </div>
            </div>

            <div className="footer-col">
              <h4>{config.footer.departmentsHeading}</h4>
              <div className="footer-links">
                {config.departments.slice(0, 4).map(d => <button key={d.name} onClick={() => go("departments")}>{d.name}</button>)}
              </div>
            </div>

            <div className="footer-col">
              <h4>{config.footer.getInvolvedHeading}</h4>
              <p className="footer-col-desc">{config.footer.getInvolvedText}</p>
              <MagneticButton className="btn btn-primary btn-sm" onClick={() => go("submit")}>{config.footer.getInvolvedButton} <ArrowRight size={14} /></MagneticButton>
            </div>
          </div>

          <div className="footer-bottom">
            <span>{config.footer.copyrightText}</span>
            <span className="footer-credit">{config.footer.creditLine}</span>
          </div>
        </footer>
      </div>
    </NavCtx.Provider>
    </SiteCtx.Provider>
  );
}
