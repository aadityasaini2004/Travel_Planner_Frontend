import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectBudgetOption, SelectTravelesList } from "@/constants/options";
import { useEffect, useState } from "react";
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

function CreateTrip() {
  const [formData, setFormData] = useState({
    location: null,
    days: "",
    budget: null,
    tripType: null,
  });
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState("");

  const { user, isSignedIn } = useUser();

  const handleInputChange = (fieldName, value) => {
    setError("");
    setFormData((prevState) => ({ ...prevState, [fieldName]: value }));
  };

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      const fetchSuggestions = async () => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Error fetching from OSM:", err);
        }
      };
      fetchSuggestions();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectSuggestion = (place) => {
    handleInputChange("location", place);
    setQuery(place.display_name);
    setSuggestions([]);
  };

  const onGenerateTrip = async () => {
    setError("");
    if (!formData.location || !formData.days || !formData.budget || !formData.tripType) {
      setError("Please fill all the details first.");
      return;
    }
    if (parseInt(formData.days) > 5 || parseInt(formData.days) < 1) {
      setError("Please enter days between 1 and 5.");
      return;
    }

    setLoading(true);
    setTripPlan("");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setError("Gemini API Key not found.");
        setLoading(false);
        return;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const prompt = `Generate a detailed travel itinerary for a trip to ${formData.location.display_name}. The trip duration is ${formData.days} days. The budget for this trip is ${formData.budget}. This is a ${formData.tripType} trip. Format the output clearly with headings for each day.`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(`API Error: ${errorData.error?.message || "Unknown error"}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const plan = data.candidates[0].content.parts[0].text;
      setTripPlan(plan);
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSaveTrip = async () => {
    if (!isSignedIn || !user) {
      setError('Please sign in to save trips');
      return;
    }
    if (!tripPlan) {
      setError('Please generate a trip first');
      return;
    }

    try {
      setLoading(true);
      
      await axios.post('http://localhost:5000/api/auth/sync', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || 'user@example.com',
        name: user.fullName || user.firstName || 'User'
      });

      const tripData = {
        clerkId: user.id,
        destination: {
          displayName: formData.location.display_name,
          placeId: formData.location.place_id
        },
        days: parseInt(formData.days),
        budget: formData.budget,
        tripType: formData.tripType,
        itinerary: tripPlan
      };

      const response = await axios.post('http://localhost:5000/api/trips/save', tripData);

      if (response.data.success) {
        alert('Trip saved successfully! 🎉');
      }
    } catch (err) {
      setError('Failed to save trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-black pointer-events-none" />

      <div className="relative z-10 sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-white font-black text-5xl md:text-6xl mb-4">
            Plan Your Trip 🏝️
          </h2>
          <p className="text-gray-400 text-xl">Fill in the details below</p>
        </div>

        <div className="space-y-10">
          {/* Location */}
          <div className="relative">
            <label className="text-white text-xl font-bold mb-3 block">
              Destination
            </label>
            <Input
              value={query}
              onChange={(e) => {
                setError("");
                setQuery(e.target.value);
              }}
              placeholder="e.g., Paris, Mumbai..."
              className="p-6 text-lg bg-white/10 border-2 border-white/20 focus:border-purple-500 rounded-2xl text-white placeholder:text-gray-500"
            />
            
            {suggestions.length > 0 && (
              <div className="absolute bg-black/95 border-2 border-white/20 rounded-2xl w-full mt-2 z-50 max-h-60 overflow-y-auto">
                {suggestions.map((place) => (
                  <div
                    key={place.place_id}
                    onClick={() => handleSelectSuggestion(place)}
                    className="p-4 cursor-pointer border-b border-white/10 last:border-b-0 hover:bg-purple-500/20 text-white"
                  >
                    {place.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Days */}
          <div>
            <label className="text-white text-xl font-bold mb-3 block">
              Number of Days (1-5)
            </label>
            <Input
              type="number"
              placeholder="Ex. 3"
              value={formData.days}
              onChange={(e) => handleInputChange("days", e.target.value)}
              className="p-6 text-lg bg-white/10 border-2 border-white/20 focus:border-purple-500 rounded-2xl text-white placeholder:text-gray-500"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-white text-xl font-bold mb-4 block">
              Budget
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SelectBudgetOption.map((item) => (
                <div
                  key={item.title}
                  onClick={() => handleInputChange("budget", item.title)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    formData.budget === item.title
                      ? 'bg-purple-600/30 border-2 border-purple-500'
                      : 'bg-white/10 border-2 border-white/20 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Type */}
          <div>
            <label className="text-white text-xl font-bold mb-4 block">
              Who's Coming?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SelectTravelesList.map((item) => (
                <div
                  key={item.title}
                  onClick={() => handleInputChange("tripType", item.title)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    formData.tripType === item.title
                      ? 'bg-purple-600/30 border-2 border-purple-500'
                      : 'bg-white/10 border-2 border-white/20 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 p-4 bg-red-500/20 border-2 border-red-500 rounded-2xl">
            <p className="text-red-300 text-center font-bold">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          <Button
            onClick={onGenerateTrip}
            disabled={loading}
            className="px-10 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-bold"
          >
            {loading ? "Generating..." : "Generate Trip ✨"}
          </Button>

          {tripPlan && (
            <Button
              onClick={onSaveTrip}
              disabled={loading}
              className="px-10 py-6 text-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded-full font-bold"
            >
              {loading ? "Saving..." : "Save Trip 💾"}
            </Button>
          )}
        </div>

        {/* Trip Plan */}
        {tripPlan && (
          <div className="mt-16 p-8 border-2 border-purple-500/30 rounded-3xl bg-white/5">
            <h2 className="text-3xl font-bold mb-6 text-purple-400">
              Your Trip Plan ✨
            </h2>
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {tripPlan}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateTrip;
