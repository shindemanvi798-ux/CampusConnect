import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import {
  ArrowRight, CalendarDays, MapPin, Search, Sparkles, Users,
  Code2, Music2, Dumbbell, Leaf, GraduationCap, Menu, X,
  CloudSun, Github, Heart, Clock3, CheckCircle2, AlertCircle
} from "lucide-react";
import { getEvents, getHealth, sendFeedback } from "./api.js";

const categoryIcons = {
  Technology: Code2, Cultural: Music2, Sports: Dumbbell,
  Community: Leaf, Workshop: GraduationCap
};

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="header">
    <div className="container nav-wrap">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-icon"><Sparkles size={20} /></span>
        <span>Campus<span className="brand-accent">Connect</span></span>
      </Link>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "nav nav-open" : "nav"}>
        <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
        <NavLink to="/events" onClick={() => setOpen(false)}>Explore events</NavLink>
        <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
        <Link className="nav-cta" to="/events" onClick={() => setOpen(false)}>Find your next event <ArrowRight size={16} /></Link>
      </nav>
    </div>
  </header>;
}

function Footer() {
  return <footer className="footer"><div className="container footer-inner">
    <Link to="/" className="brand"><span className="brand-icon"><Sparkles size={18}/></span><span>Campus<span className="brand-accent">Connect</span></span></Link>
    <span>Made for curious minds and campus communities.</span>
    <span className="footer-heart">Built with <Heart size={14} fill="currentColor" /></span>
  </div></footer>;
}

function StatusPill() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    getHealth().then(() => setStatus("online")).catch(() => setStatus("offline"));
  }, []);
  return <span className={`status-pill ${status}`}><span className="status-dot" />API {status === "checking" ? "checking" : status === "online" ? "connected" : "offline"}</span>;
}

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,apparent_temperature,weather_code&timezone=Asia%2FKolkata")
      .then(r => { if (!r.ok) throw new Error("Weather unavailable"); return r.json(); })
      .then(data => { if (active) setWeather(data.current); })
      .catch(() => { if (active) setError("Weather data is temporarily unavailable."); });
    return () => { active = false; };
  }, []);
  return <div className="weather-card">
    <div className="weather-icon"><CloudSun size={24}/></div>
    <div><span className="eyebrow">CAMPUS WEATHER · PUNE</span>
      <div className="weather-temp">{weather ? `${Math.round(weather.temperature_2m)}°C` : error ? "Unavailable" : "Loading…"}</div>
      <p>{weather ? `Feels like ${Math.round(weather.apparent_temperature)}°C · Live public API` : error || "Fetching current conditions…"}</p>
    </div>
  </div>;
}

function EventCard({ event }) {
  const Icon = categoryIcons[event.category] || CalendarDays;
  const date = new Date(`${event.date}T12:00:00`);
  return <article className="event-card">
    <div className={`event-art art-${(event.id % 4) + 1}`}><Icon size={32}/><span className="art-orbit" /></div>
    <div className="event-card-body">
      <div className="event-meta"><span className="category-tag">{event.category}</span><span><Clock3 size={13}/> {date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span></div>
      <h3>{event.title}</h3><p>{event.description}</p>
      <div className="event-location"><MapPin size={15}/>{event.location}</div>
      <div className="event-card-bottom"><span>By {event.organizer}</span><span className="round-arrow"><ArrowRight size={17}/></span></div>
    </div>
  </article>;
}

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getEvents().then(data => setEvents(data.slice(0, 3))).catch(() => setEvents([])).finally(() => setLoading(false));
  }, []);
  return <>
    <section className="hero"><div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
      <div className="container hero-grid">
        <div className="hero-copy"><div className="hero-label"><span className="label-star">✳</span> YOUR CAMPUS, YOUR COMMUNITY</div>
          <h1>Make campus life<br/> <span className="gradient-text">unforgettable.</span></h1>
          <p className="hero-description">Discover events, meet your people, and find the experiences that make your college years count.</p>
          <div className="hero-actions"><Link to="/events" className="btn btn-primary">Explore events <ArrowRight size={18}/></Link><Link to="/contact" className="btn btn-secondary">Get in touch</Link></div>
          <div className="hero-proof"><div className="avatar-stack"><span>🎓</span><span>🎨</span><span>💻</span><span>🎵</span></div><span>One campus. Endless possibilities.</span></div>
        </div>
        <div className="hero-side"><div className="floating-chip chip-top"><span className="chip-emoji">✨</span><span><b>Find your people</b><small>Discover communities</small></span></div>
          <div className="hero-visual"><div className="visual-topline"><span>THE CAMPUS EDIT</span><span className="live-mark"><i/> LIVE</span></div>
            <div className="visual-symbol"><div className="symbol-ring ring-a"/><div className="symbol-ring ring-b"/><div className="symbol-center"><Sparkles size={52}/></div><span className="symbol-star star-a">✳</span><span className="symbol-star star-b">✦</span><span className="symbol-star star-c">✧</span></div>
            <div className="visual-bottom"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h3>Starts right here.</h3></div><Link to="/events" className="visual-link"><ArrowRight/></Link></div>
          </div><div className="floating-chip chip-bottom"><span className="chip-emoji">📅</span><span><b>Something is happening</b><small>Check out upcoming events</small></span></div>
        </div>
      </div>
    </section>
    <section className="trust-strip"><div className="container trust-inner"><div><Users/><span>Student communities</span></div><div><CalendarDays/><span>Events that matter</span></div><div><Sparkles/><span>Experiences to remember</span></div><StatusPill/></div></section>
    <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">DON'T MISS OUT</span><h2>Happening on campus<span className="period">.</span></h2><p>Good things happen when you show up.</p></div><Link className="text-link" to="/events">All events <ArrowRight size={17}/></Link></div>
      {loading ? <div className="state-box">Loading events from the backend…</div> : events.length ? <div className="event-grid">{events.map(e => <EventCard key={e.id} event={e}/>)}</div> : <div className="state-box">Events could not be loaded. Check that the FastAPI backend is running.</div>}
    </div></section>
    <section className="section section-tint"><div className="container split-section"><div><span className="eyebrow">A LITTLE EXTRA</span><h2>Plan your day,<br/><span className="gradient-text">the smarter way.</span></h2><p className="muted">Check current weather conditions before heading to your next campus event.</p><Link to="/events" className="btn btn-primary">Find an event <ArrowRight size={17}/></Link></div><WeatherCard/></div></section>
    <section className="cta-section"><div className="container cta-box"><div><span className="eyebrow">BE PART OF THE STORY</span><h2>Your campus has a lot to offer.</h2><p>Start exploring what is happening around you.</p></div><Link to="/events" className="btn btn-light">Let's explore <ArrowRight size={18}/></Link></div></section>
  </>;
}

function Events() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const categories = ["All", "Technology", "Cultural", "Sports", "Community", "Workshop"];
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const timer = setTimeout(() => {
      getEvents(query, category).then(data => { if (active) setEvents(data); })
        .catch(err => { if (active) setError(err.message); })
        .finally(() => { if (active) setLoading(false); });
    }, 180);
    return () => { active = false; clearTimeout(timer); };
  }, [query, category]);
  return <main className="page-main"><section className="page-hero"><div className="container"><span className="eyebrow">THE CAMPUS CALENDAR</span><h1>Find your <span className="gradient-text">next thing.</span></h1><p>From hands-on workshops to unforgettable nights, there's something for every kind of curious.</p><StatusPill/></div></section>
    <section className="section"><div className="container">
      <div className="event-tools"><label className="search-box"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events, places, organisers…" aria-label="Search events"/></label>
        <div className="filter-row">{categories.map(c => <button key={c} className={`filter-chip ${category === c ? "selected" : ""}`} onClick={() => setCategory(c)}>{c}</button>)}</div>
      </div>
      <div className="results-line"><span>{loading ? "Searching events…" : `${events.length} event${events.length === 1 ? "" : "s"} found`}</span><span>Sorted by date</span></div>
      {loading ? <div className="state-box"><span className="spinner"/> Loading events from FastAPI…</div> : error ? <div className="error-box"><AlertCircle/><div><b>Couldn't load events</b><p>{error}</p><button className="text-link" onClick={() => {setQuery(query + " "); setTimeout(() => setQuery(query.trim()), 0);}}>Try again</button></div></div> : events.length ? <div className="event-grid">{events.map(e => <EventCard key={e.id} event={e}/>)}</div> : <div className="state-box">No events match your search. Try another keyword or category.</div>}
    </div></section>
  </main>;
}

function Contact() {
  const [form, setForm] = useState({name:"", email:"", message:""});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const update = e => setForm({...form, [e.target.name]: e.target.value});
  async function submit(e) {
    e.preventDefault(); setStatus("sending"); setError("");
    try {
      await sendFeedback(form);
      setStatus("sent"); setForm({name:"",email:"",message:""});
    } catch (err) { setStatus("error"); setError(err.message); }
  }
  return <main className="page-main"><section className="page-hero"><div className="container"><span className="eyebrow">WE'RE LISTENING</span><h1>Let's talk<span className="gradient-text">.</span></h1><p>Have a question, idea, or event to share? Send us a note.</p></div></section>
    <section className="section"><div className="container contact-grid"><div className="contact-info"><span className="eyebrow">SAY HELLO</span><h2>Good ideas start with a conversation.</h2><p className="muted">Use this form to share feedback or ask about campus events. Your message is saved through our FastAPI backend.</p><div className="contact-note"><span className="note-icon"><Sparkles/></span><div><b>Built around students</b><p>CampusConnect is designed to make campus activities easier to discover.</p></div></div><div className="contact-note"><span className="note-icon"><CheckCircle2/></span><div><b>Connected to the backend</b><p>Successful submissions are stored in the local SQLite database.</p></div></div></div>
      <form className="contact-form" onSubmit={submit}><h3>Send a message</h3><p>Fields marked with * are required.</p><label>Your name *<input name="name" value={form.name} onChange={update} required minLength="2" maxLength="80" placeholder="e.g. Aditi Sharma"/></label><label>Email address *<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" maxLength="160"/></label><label>Your message *<textarea name="message" value={form.message} onChange={update} required minLength="5" maxLength="2000" rows="5" placeholder="Tell us what's on your mind…"/></label>
        {status === "sent" && <div className="success-message"><CheckCircle2 size={18}/> Message saved successfully!</div>}
        {status === "error" && <div className="error-message"><AlertCircle size={18}/> {error}</div>}
        <button className="btn btn-primary submit-btn" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"} <ArrowRight size={17}/></button>
      </form>
    </div></section>
  </main>;
}

export default function App() {
  return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/events" element={<Events/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<main className="section container"><h2>Page not found</h2><Link className="text-link" to="/">Go home <ArrowRight size={17}/></Link></main>}/></Routes><Footer/></>;
}
