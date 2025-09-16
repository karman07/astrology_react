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
} from "lucide-react";

const API_KEY = "AIzaSyDDuCc_V3eZavSm91--KyZcjaPToF_MCPU"; // replace with your Gemini key
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Helper function to parse markdown-like content
const parseMarkdownContent = (text: string) => {
  if (!text) return [];
  const sections = text.split(/(?=##\s|\#\s)/);
  return sections.filter((section) => section.trim()).map((section) => {
    const lines = section.split("\n").filter((line) => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, "").replace(/\*\*/g, "");
    const content = lines.slice(1).join("\n");
    return { title, content };
  });
};

// Component for rendering individual sections
const AstrologySection: React.FC<{
  title: string;
  content: string;
  icon: React.ReactNode;
  gradient: string;
}> = ({ title, content, icon, gradient }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div
        className={`${gradient} p-4 cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div
            className={`transform transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <div className="p-6 text-gray-700 dark:text-gray-300">
          <div
            className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/\n/g, "<br/>")
                .replace(/^-\s+/gm, "• "),
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

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    time: "",
    place: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchAstrology = async () => {
    setLoading(true);
    setResult(null);
    setShowResult(false);

    try {
      const prompt = `
You are an expert astrologer. 
Based on these details:
- Name: ${formData.name}
- Date of Birth: ${formData.dob}
- Time of Birth: ${formData.time}
- Place of Birth: ${formData.place}

Generate a beautifully formatted astrology report in **markdown only** with these exact sections:

## 🌟 Basic Info
## ♈ Zodiac Sign & Personality
## 💫 Daily/Weekly Insights
## ❤️ Love & Relationships
## 💼 Career & Finance
## 🧘 Health & Wellness
## 🔮 Final Guidance

⚠️ Rules:
- Do NOT add any introduction text or disclaimers.
- Only output the sections above.
`;

      const response = await fetch(GEMINI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No prediction available.";

      setResult(text);
      setShowResult(true);
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
      icon: <Star className="w-5 h-5" />,
      gradient: "bg-slate-700 dark:bg-slate-600",
    },
    {
      icon: <User className="w-5 h-5" />,
      gradient: "bg-blue-700 dark:bg-blue-600",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      gradient: "bg-amber-700 dark:bg-amber-600",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      gradient: "bg-rose-700 dark:bg-rose-600",
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      gradient: "bg-emerald-700 dark:bg-emerald-600",
    },
    {
      icon: <Activity className="w-5 h-5" />,
      gradient: "bg-indigo-700 dark:bg-indigo-600",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      gradient: "bg-purple-700 dark:bg-purple-600",
    },
  ];

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
        {/* Header */}
        <header className="relative z-10 flex justify-between items-center px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3">
            <Star className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-semibold">AstroGuide</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800"
          >
            {darkMode ? (
              <Sun size={20} className="text-slate-400" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>
        </header>

        <div className="relative z-10">
          {!showResult ? (
            // Form Section
            <main className="max-w-xl mx-auto mt-12 p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 space-y-6">
                <h2 className="text-xl font-semibold">Birth Chart Analysis</h2>

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  name="place"
                  placeholder="Place of Birth"
                  value={formData.place}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700"
                />

                <button
                  onClick={fetchAstrology}
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.dob ||
                    !formData.time ||
                    !formData.place
                  }
                  className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 rounded-md text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating Report...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </button>
              </div>
            </main>
          ) : (
            // Results Section
            <main className="max-w-4xl mx-auto mt-8 p-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold">
                  Astrology Report for {formData.name}
                </h2>
                <button
                  onClick={() => setShowResult(false)}
                  className="inline-flex items-center px-4 py-2 mt-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm"
                >
                  ← New Reading
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <AstrologySection
                    key={index}
                    title={section.title}
                    content={section.content}
                    icon={
                      sectionConfig[index]?.icon || (
                        <Star className="w-5 h-5" />
                      )
                    }
                    gradient={
                      sectionConfig[index]?.gradient ||
                      "bg-slate-700 dark:bg-slate-600"
                    }
                  />
                ))}
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
