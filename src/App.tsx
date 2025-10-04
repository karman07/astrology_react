import React, { useState } from "react";
import {
  Moon,
  Sun,
  Loader2,
  Star,
  Heart,
  Briefcase,
  User,
  Sparkles,
  Eye,
  Activity,
  Calendar,
  Clock,
  MapPin,
  Zap,
  ChevronDown,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";

// 🔮 GEMINI API - Google's Advanced AI Model
const API_KEY = 'AIzaSyDDuCc_V3eZavSm91--KyZcjaPToF_MCPU';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Enhanced function to parse and filter markdown content
const parseMarkdownContent = (text: string) => {
  if (!text) return [];
  
  // Remove unwanted introduction text
  let cleanedText = text
    .replace(/^.*?(?=##)/s, '') // Remove everything before first ##
    .replace(/Okay,.*?designed to provide.*?remedies\.\s*/gi, '') // Remove specific unwanted intro
    .replace(/Here is.*?report.*?\./gi, '') // Remove generic intro statements
    .replace(/This report.*?guidance.*?\./gi, '') // Remove report descriptions
    .trim();

  const sections = cleanedText.split(/(?=##\s)/);
  
  return sections
    .filter((section) => {
      const trimmed = section.trim();
      if (!trimmed) return false;
      
      // Check if section has meaningful content (more than just header)
      const lines = trimmed.split('\n').filter(line => line.trim());
      if (lines.length < 2) return false;
      
      // Check if section has actual content beyond the header
      const contentLines = lines.slice(1).join(' ').trim();
      if (contentLines.length < 20) return false; // At least 20 characters of content
      
      return true;
    })
    .map((section) => {
      const lines = section.split("\n").filter((line) => line.trim());
      const title = lines[0]?.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      const content = lines.slice(1).join("\n").trim();
      return { title, content };
    })
    .filter(section => section.title && section.content); // Ensure both title and content exist
};

// Enhanced responsive AstrologySection component
const AstrologySection: React.FC<{
  title: string;
  content: string;
  icon: React.ReactNode;
  gradient: string;
}> = ({ title, content, icon, gradient }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div
        className={`${gradient} p-4 sm:p-6 cursor-pointer hover:opacity-90 transition-opacity duration-200`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              {icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-wide break-words">{title}</h3>
          </div>
          <div
            className={`transform transition-transform duration-300 ease-out flex-shrink-0 ml-2 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-none opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 text-gray-700 dark:text-gray-300">
          <div
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert leading-relaxed prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-em:text-purple-600 dark:prose-em:text-purple-400"
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/\*\*(.*?)\*\*/g, "<strong class='text-indigo-600 dark:text-indigo-400 font-semibold'>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em class='text-purple-600 dark:text-purple-400'>$1</em>")
                .replace(/\n\n/g, "</p><p class='mt-4'>")
                .replace(/\n/g, "<br/>")
                .replace(/^-\s+/gm, "<span class='text-amber-500 font-bold'>•</span> ")
                .replace(/^(\d+\.\s+)/gm, "<span class='text-blue-500 font-bold'>$1</span>")
                .replace(/^(.*?:)/gm, "<span class='text-gray-900 dark:text-gray-100 font-semibold'>$1</span>"),
            }}
          />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    time: "",
    place: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Copy report to clipboard
  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      // Create clean text version for copying
      const cleanText = result
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      await navigator.clipboard.writeText(`ASTROLOGY REPORT FOR ${formData.name.toUpperCase()}\n\nBirth Details:\n- Date: ${new Date(formData.dob).toLocaleDateString()}\n- Time: ${formData.time}\n- Place: ${formData.place}\n\n${cleanText}`);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Download report as PDF (simplified version - creates a formatted text file)
  const downloadPDF = () => {
    if (!result) return;
    
    const cleanText = result
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    const reportContent = `ASTROLOGY REPORT FOR ${formData.name.toUpperCase()}

Birth Details:
- Date: ${new Date(formData.dob).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
- Time: ${formData.time}
- Place: ${formData.place}

Generated on: ${new Date().toLocaleDateString()}

${cleanText}

---
Generated by AstroVision Pro`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name.replace(/\s+/g, '_')}_Astrology_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const fetchAstrology = async () => {
    setLoading(true);
    setResult(null);
    setShowResult(false);

    try {
      const prompt = `You are a MASTER VEDIC ASTROLOGER with 30+ years of experience. Create an extremely detailed, comprehensive astrology report for:

**BIRTH DETAILS:**
Name: ${formData.name}
Date of Birth: ${formData.dob}
Time of Birth: ${formData.time}
Place of Birth: ${formData.place}

**INSTRUCTIONS:** Create a detailed, personalized astrology report with rich insights. Each section should be comprehensive and specific to this birth chart. Use ONLY the exact section headers below:

## 🌟 Basic Info
- Calculate and provide: Exact Sun sign with degree, Moon sign with degree, Rising/Ascendant sign with degree
- List ALL planetary positions (Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu) with signs and degrees
- Mention birth chart type (if applicable: Rajyoga, Dhanyoga, etc.)
- Include ruling planets and their significance
- Calculate birth star/nakshatra and its influence
- Mention any special planetary combinations (yogas)

## ♈ Zodiac Sign & Personality
- Deep analysis of Sun sign traits with specific examples for this person
- Moon sign emotional patterns and mental tendencies
- Rising sign: how others perceive them, first impressions
- Detailed personality strengths (at least 5 specific traits)
- Challenges and areas for growth (at least 4 specific areas)
- Hidden personality aspects revealed by planetary positions
- Communication style and learning preferences
- Natural talents and gifted areas
- Behavioral patterns in different situations

## 💫 Daily/Weekly Insights
- Current planetary transits affecting this person specifically
- Daily energy patterns and best times for activities
- Weekly focus areas and opportunities
- Favorable days of the week and dates
- Activities to embrace and avoid this period
- Mental and emotional state predictions
- Lucky colors, numbers, and directions for this period
- Recommended mantras or practices for current energy

## ❤️ Love & Relationships
- Detailed romantic compatibility analysis
- Specific partner traits that would complement this person
- Physical and personality descriptions of ideal partner
- Potential partner's zodiac signs and characteristics
- Timing predictions: when relationships are likely to begin
- Relationship patterns and cycles in their life
- Love challenges and how to overcome them
- Marriage timing and auspicious periods
- Family relationships and dynamics
- Friendship patterns and social compatibility
- Sexual and emotional compatibility factors

## � Career & Finance
- Best career fields with specific job titles and industries
- Natural business abilities and entrepreneurial potential
- Success timing: specific years and periods for career growth
- Income patterns and wealth accumulation potential
- Investment advice and financial planning guidance
- Professional relationships and networking advantages
- Leadership qualities and management style
- Creative and artistic potentials
- Best work environments and company cultures
- Career change timing and opportunities

## 🧘 Health & Wellness
- Physical constitution and body type analysis
- Specific health strengths and vulnerabilities
- Mental health patterns and stress management needs
- Recommended diet based on astrological constitution
- Exercise types that suit their energy patterns
- Sleep patterns and optimal rest schedules
- Seasonal health variations and precautions
- Specific body parts to focus on for health
- Preventive measures for potential health issues
- Healing modalities that would work best
- Lifestyle recommendations for optimal wellbeing

## 🔮 Final Guidance
- Life purpose and dharma based on birth chart
- Spiritual path recommendations and practices
- Major life lessons and karmic patterns
- Specific guidance for next 6-12 months
- Important life transitions and timing
- Mantras, gemstones, or remedies for enhancement
- Lucky days, times, and directions
- Key relationships and partnerships to cultivate
- Personal growth areas and development focus
- Success strategies tailored to their chart

**REQUIREMENTS:**
- Each section must be 150-300 words (detailed and comprehensive)
- Be specific and personalized, not generic
- Include practical, actionable advice
- Use astrological terminology appropriately
- Provide specific timing when possible
- Make predictions confident but realistic
- Include remedies and enhancement suggestions`;

      // 1) Call Gemini API to generate the full report
      const geminiResponse = await fetch(GEMINI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            candidateCount: 1,
          },
        }),
      });

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error('Gemini error:', geminiResponse.status, errText);
        throw new Error(`Gemini API Error ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const generatedText =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text || geminiData.output?.[0]?.content || geminiData.text || null;

      if (!generatedText) {
        throw new Error('Gemini returned no text.');
      }

      // Show the generated report in the UI
      setResult(generatedText as string);
      setShowResult(true);

      // 2) Save the generated report to local API
      try {
        const localApiUrl = 'http://82.112.231.134:4000/astrology';
        const savePayload = {
          name: formData.name,
          dateOfBirth: formData.dob,
          timeOfBirth: formData.time,
          placeOfBirth: formData.place,
          report: generatedText,
          source: 'gemini-2.0-flash',
        };

        const saveResp = await fetch(localApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload),
        });

        if (!saveResp.ok) {
          const err = await saveResp.text();
          console.error('Failed to save report locally:', saveResp.status, err);
          // don't throw — saving is best-effort; UI should still show report
        } else {
          // Optionally consume response
          const saveData = await saveResp.json();
          console.log('Saved report id:', saveData.id || saveData._id || saveData.reportId || 'unknown');
        }
      } catch (saveErr) {
        console.error('Local save exception:', saveErr);
      }
    } catch (error) {
      console.error(error);
      setResult("⚠️ Failed to fetch astrology data.");
      setShowResult(true);
    }
    setLoading(false);
  };

  const sections = result ? parseMarkdownContent(result) : [];

  const sectionConfig = [
    {
      icon: <Star className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
    {
      icon: <User className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-rose-500 to-pink-500",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-indigo-500 to-blue-500",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      gradient: "bg-gradient-to-r from-purple-500 to-indigo-500",
    },
  ];

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      {/* Background with gradient */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-500">
        
        {/* Professional Header */}
        <header className="relative z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 p-3 rounded-xl">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    AstroVision Pro
                  </h1>
                  {/* <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Gemini AI</p> */}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  {darkMode ? (
                    <Sun size={20} className="text-gray-600 dark:text-gray-300 relative z-10" />
                  ) : (
                    <Moon size={20} className="text-gray-600 dark:text-gray-300 relative z-10" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10">
          {!showResult ? (
            // Professional Form Section
            <main className="max-w-2xl mx-auto pt-16 pb-24 px-6">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  Discover Your Cosmic Blueprint
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Unlock the secrets of your birth chart with AI-powered Vedic astrology insights
                </p>
              </div>

              {/* Enhanced Form */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl"></div>
                
                <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Birth Chart Analysis</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Your Birth Details</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Name Input */}
                    <div className="group">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="w-4 h-4" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Date Input */}
                    <div className="group">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Date of Birth</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Time Input */}
                    <div className="group">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>Time of Birth</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Place Input */}
                    <div className="group">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>Place of Birth</span>
                      </label>
                      <input
                        type="text"
                        name="place"
                        placeholder="City, State, Country"
                        value={formData.place}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={fetchAstrology}
                      disabled={
                        loading ||
                        !formData.name ||
                        !formData.dob ||
                        !formData.time ||
                        !formData.place
                      }
                      className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="relative flex justify-center items-center space-x-3">
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            <span>Generating Your Cosmic Report...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            <span>Generate Astrology Report</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      {/* <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>AI Powered</span>
                      </div> */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Instant Results</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>100% Private</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          ) : (
            // Professional Responsive Results Section
            <main className="max-w-7xl mx-auto pt-4 sm:pt-8 pb-8 sm:pb-16 px-4 sm:px-6">
              {/* Results Header */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Report Generated Successfully</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent px-4">
                  Cosmic Analysis for {formData.name}
                </h2>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
                  <p className="mb-2">
                    Born on {new Date(formData.dob).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {formData.time}
                  </p>
                  <p>in {formData.place}</p>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
                  <button
                    onClick={() => setShowResult(false)}
                    className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>New Reading</span>
                  </button>
                  
                  <button 
                    onClick={copyToClipboard}
                    className={`inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                      copySuccess 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copySuccess ? 'Copied!' : 'Copy Report'}</span>
                  </button>
                  
                  <button 
                    onClick={downloadPDF}
                    className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl transition-colors duration-200 text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Responsive Results Grid */}
              <div className="grid gap-4 sm:gap-6 lg:gap-8">
                {sections.length > 0 ? (
                  sections.map((section, index) => (
                    <AstrologySection
                      key={index}
                      title={section.title}
                      content={section.content}
                      icon={
                        sectionConfig[index]?.icon || (
                          <Star className="w-6 h-6" />
                        )
                      }
                      gradient={
                        sectionConfig[index]?.gradient ||
                        "bg-gradient-to-r from-slate-600 to-slate-700"
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-6 py-3 rounded-full">
                      <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 dark:text-amber-300">
                        No astrology sections found. Please try generating a new report.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="mt-16 text-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Want Another Reading?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Explore different aspects of your cosmic blueprint or generate a reading for someone else
                  </p>
                  <button
                    onClick={() => setShowResult(false)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Generate New Report
                  </button>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
