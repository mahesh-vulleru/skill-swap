import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, Star, Users, ArrowRight, Code, Palette, Briefcase, Languages, Video, Database } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { ISkill, ISkillCategory } from '../../types';

export const ExploreSkillsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<ISkill[]>([]);
  const [categories, setCategories] = useState<ISkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/skills/categories')
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') query.append('category', selectedCategory);
    if (searchTerm) query.append('search', searchTerm);
    if (selectedLevel && selectedLevel !== 'All') query.append('level', selectedLevel);

    api.get(`/skills?${query.toString()}`)
      .then((res) => {
        if (res.data.success) setSkills(res.data.skills || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, searchTerm, selectedLevel]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') newParams.delete('category');
    else newParams.set('category', catName);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Explore Skills"
        subtitle="Discover in-demand tech, design, business, and creative skills ready to exchange"
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Search & Filter Top Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search skills by title, tags or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-stone-500">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Categories ({skills.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <Card
              key={skill._id}
              className="flex flex-col justify-between hover:border-forest-600 transition-all p-6 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="forest" size="sm">
                    {skill.category}
                  </Badge>
                  <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {skill.level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 group-hover:text-forest-700 transition-colors">
                  {skill.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                  {skill.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {skill.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-4 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" /> {skill.learnerCount} learners
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {skill.rating}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/matches?skill=${encodeURIComponent(skill.title)}`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Find Peer Mentors
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

