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

  // Clerk user hook
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
    if (
      !formData.location ||
      !formData.days ||
      !formData.budget ||
      !formData.tripType
    ) {
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

      // Gemini REST API endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const prompt = `Generate a detailed travel itinerary for a trip to ${formData.location.display_name}. The trip duration is ${formData.days} days. The budget for this trip is ${formData.budget}. This is a ${formData.tripType} trip. Format the output clearly with headings for each day.`;

      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        setError(`API Error: ${errorData.error?.message || "Unknown error"}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const plan = data.candidates[0].content.parts[0].text;
      setTripPlan(plan);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save Trip Function
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
      
      // First, sync user with backend
      await axios.post('http://localhost:5000/api/auth/sync', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || 'user@example.com',
        name: user.fullName || user.firstName || 'User'
      });

      // Now save the trip
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

      const response = await axios.post(
        'http://localhost:5000/api/trips/save',
        tripData
      );

      if (response.data.success) {
        alert('Trip saved successfully! 🎉');
      }
    } catch (err) {
      console.error('Save Error:', err);
      setError('Failed to save trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">
      <h2 className="font-bold text-3xl">Tell Us Your Travel Preference. 🏝️</h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide some basic information...
      </p>

      <div className="mt-16 flex flex-col gap-10">
        <div className="relative">
          <h2 className="text-xl font-bold mb-3">
            What is your destination of choice?
          </h2>
          <Input
            value={query}
            onChange={(e) => {
              setError("");
              setQuery(e.target.value);
            }}
            placeholder="e.g., Paris, Mumbai..."
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-lg shadow-md w-full mt-1 z-50">
              {suggestions.map((place) => (
                <li
                  key={place.place_id}
                  onClick={() => handleSelectSuggestion(place)}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold my-3">
            How many days do you want to go?
          </h2>
          <Input
            type="number"
            placeholder="Ex. 3"
            value={formData.days}
            onChange={(e) => handleInputChange("days", e.target.value)}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold my-3">What is your budget?</h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectBudgetOption.map((item) => (
              <div
                key={item.title}
                onClick={() => handleInputChange("budget", item.title)}
                className={`p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-all ${
                  formData.budget === item.title
                    ? "shadow-2xl border-purple-600"
                    : "hover:border-gray-300"
                }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold my-3">
            What do you plan on your next Adventure?
          </h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectTravelesList.map((item) => (
              <div
                key={item.title}
                onClick={() => handleInputChange("tripType", item.title)}
                className={`p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-all ${
                  formData.tripType === item.title
                    ? "shadow-2xl border-purple-600"
                    : "hover:border-gray-300"
                }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center mt-4 font-bold">{error}</p>
      )}

      <div className="my-10 justify-center flex gap-5">
        <Button onClick={onGenerateTrip} disabled={loading}>
          {loading ? "Generating..." : "Generate Trip"}
        </Button>
        
        {tripPlan && (
          <Button onClick={onSaveTrip} disabled={loading} variant="outline">
            {loading ? "Saving..." : "Save Trip"}
          </Button>
        )}
      </div>

      {tripPlan && (
        <div className="mt-10 p-5 border rounded-lg bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">
            Your AI-Generated Trip Plan
          </h2>
          <p className="whitespace-pre-wrap">{tripPlan}</p>
        </div>
      )}
    </div>
  );
}

export default CreateTrip;
