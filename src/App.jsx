import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-black pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 text-center">
        {/* Title */}
        <h1 className="text-white font-black text-7xl md:text-9xl mb-6">
          Travel Buddy
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-2xl md:text-3xl max-w-3xl mb-12">
          AI-Powered Trip Planner •{' '}
          <span className="text-purple-400">Create Your Perfect Adventure</span>
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/create-trip')}
          className="text-xl px-12 py-7 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-bold"
        >
          Start Planning ✨
        </Button>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-5xl">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-5xl mb-3">🌍</div>
            <h3 className="text-white font-bold text-lg">Smart Destinations</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-5xl mb-3">📅</div>
            <h3 className="text-white font-bold text-lg">Custom Plans</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-5xl mb-3">💰</div>
            <h3 className="text-white font-bold text-lg">Budget Friendly</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="text-white font-bold text-lg">For Everyone</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
