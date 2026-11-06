import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Search,
  Sparkles,
  Users,
  ShieldCheck,
  Award,
  Zap,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Coins,
  Star,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/skills?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/skills');
    }
  };

  const featuredSkills = [
    { title: 'React & TypeScript', category: 'Programming', learners: 340, mentors: 52, rating: 4.9, icon: '⚡' },
    { title: 'Figma UI/UX & Design Systems', category: 'Design', learners: 420, mentors: 65, rating: 4.9, icon: '🎨' },
    { title: 'Python & Data Analysis', category: 'Data Science', learners: 290, mentors: 40, rating: 4.8, icon: '📊' },
    { title: 'Conversational Spanish', category: 'Language', learners: 180, mentors: 28, rating: 4.9, icon: '🌍' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-200/60 text-forest-800 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-action" />
            Empowering 10,000+ Peer Knowledge Exchanges
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-[1.15]">
            Share What You Know, <br className="hidden sm:inline" />
            <span className="text-forest-700 underline decoration-action/40 decoration-wavy decoration-2">
              Learn What You Love.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            The egalitarian knowledge exchange network. Swap programming, design, language, and business expertise 1-on-1 using learning credits — with zero financial barriers.
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto flex items-center bg-white p-2 rounded-2xl shadow-elevated border border-stone-200/80">
            <div className="pl-4 text-stone-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search skills (e.g. React, Figma, Spanish, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-transparent text-sm text-stone-800 placeholder-stone-400 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" className="shrink-0">
              Explore Skills
            </Button>
          </form>

          {/* Quick CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Swapping Free
              </Button>
            </Link>
            <Link to="/matches">
              <Button variant="outline" size="lg" leftIcon={<Sparkles className="w-4 h-4 text-action" />}>
                Find Exchange Partners
              </Button>
            </Link>
          </div>

          {/* Platform Statistics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-stone-200/60">
            <div>
              <div className="text-3xl font-extrabold text-forest-800 font-['Plus_Jakarta_Sans']">12,500+</div>
              <p className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wide">Skills Exchanged</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-forest-800 font-['Plus_Jakarta_Sans']">4.95 ★</div>
              <p className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wide">Average Rating</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-action font-['Plus_Jakarta_Sans']">98%</div>
              <p className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wide">Match Success</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-forest-800 font-['Plus_Jakarta_Sans']">$0</div>
              <p className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wide">Financial Barrier</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills Carousel / Cards */}
      <section className="py-16 bg-white border-y border-stone-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <Badge variant="orange">Trending Right Now</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2 font-['Plus_Jakarta_Sans']">
                Popular Knowledge Exchanges
              </h2>
            </div>
            <Link to="/skills" className="mt-3 md:mt-0 text-sm font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1">
              View all 200+ skills <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSkills.map((skill, index) => (
              <Card key={index} className="flex flex-col justify-between hover:border-forest-600 transition-all cursor-pointer group" onClick={() => navigate('/skills')}>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {skill.icon}
                  </div>
                  <Badge variant="forest" size="sm">{skill.category}</Badge>
                  <h3 className="text-base font-bold text-stone-900 mt-2 group-hover:text-forest-700 transition-colors">
                    {skill.title}
                  </h3>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>{skill.learners} learners</span>
                  <span className="flex items-center gap-1 text-stone-800 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {skill.rating}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="forest">Streamlined Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2 font-['Plus_Jakarta_Sans']">
            How SkillSwap Works
          </h2>
          <p className="text-stone-600 mt-3 max-w-xl mx-auto text-sm">
            Swap skills with zero monetary cost in 4 simple steps.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-forest-600 text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-stone-900">List Your Skills</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Add skills you can teach (Offers) and skills you yearn to master (Wants) to your profile.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-action text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-stone-900">Smart Match</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Our algorithm discovers reciprocal peers where your offers match their wants, with compatibility scoring.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-forest-700 text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-stone-900">Schedule & Swap</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Agree on a date, book a session with Google Meet, and hop on an interactive 1-on-1 exchange.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-stone-900">Earn Credits & Badges</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Earn 10 learning credits every time you mentor, build your reputation score, and unlock Top Mentor badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section id="community" className="py-16 bg-forest-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans']">
              Loved by Creators, Developers & Lifelong Learners
            </h2>
            <p className="text-emerald-200/70 text-sm mt-2">
              Hear directly from community members swapping skills across the globe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-forest-800/80 p-6 rounded-2xl border border-forest-700/60 flex flex-col justify-between">
              <p className="text-sm text-emerald-100 italic">
                "I taught React component architecture to Elena and she taught me Figma design systems. In two weeks, my side project looks ten times better!"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Marcus"
                  className="w-10 h-10 rounded-full object-cover border border-action"
                />
                <div>
                  <h5 className="text-xs font-bold text-white">Marcus Vance</h5>
                  <p className="text-[11px] text-emerald-300">Full-Stack Dev • Austin, TX</p>
                </div>
              </div>
            </div>

            <div className="bg-forest-800/80 p-6 rounded-2xl border border-forest-700/60 flex flex-col justify-between">
              <p className="text-sm text-emerald-100 italic">
                "SkillSwap solved my biggest learning barrier: finding patient mentors. The credit economy keeps both sides engaged and accountable."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Elena"
                  className="w-10 h-10 rounded-full object-cover border border-action"
                />
                <div>
                  <h5 className="text-xs font-bold text-white">Elena Rostova</h5>
                  <p className="text-[11px] text-emerald-300">Design Lead • San Francisco, CA</p>
                </div>
              </div>
            </div>

            <div className="bg-forest-800/80 p-6 rounded-2xl border border-forest-700/60 flex flex-col justify-between">
              <p className="text-sm text-emerald-100 italic">
                "Swapping Python data science for video editing gave me the skills to launch my tech YouTube channel. Truly revolutionary platform."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Sarah"
                  className="w-10 h-10 rounded-full object-cover border border-action"
                />
                <div>
                  <h5 className="text-xs font-bold text-white">Sarah Chen</h5>
                  <p className="text-[11px] text-emerald-300">Data Scientist • Seattle, WA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-600 flex items-center justify-center text-white">
              <ArrowLeftRight className="w-4 h-4 text-action" />
            </div>
            <span className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Skill<span className="text-action">Swap</span>
            </span>
          </div>
          <p className="text-xs">
            © 2026 SkillSwap Knowledge Exchange Network. Built with React, Vite, Node.js & MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );
};

