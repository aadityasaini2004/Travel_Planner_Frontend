import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function MyTrips() {
  const { user, isSignedIn } = useUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && user) {
      fetchTrips();
    }
  }, [isSignedIn, user]);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/trips/my-trips/${user.id}`
      );
      
      if (response.data.success) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/trips/${tripId}`
      );

      if (response.data.success) {
        setTrips(trips.filter(trip => trip._id !== tripId));
        alert('Trip deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-3xl font-bold mb-4">Please sign in to view your trips</h2>
          <p className="text-gray-400">Sign in using the button in the header</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading your trips...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-black pointer-events-none" />

      <div className="relative z-10 sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5">
        {/* Title */}
        <div className="mb-12">
          <h2 className="text-white font-black text-5xl md:text-6xl mb-3">
            My Trips 🗺️
          </h2>
          <p className="text-gray-400 text-xl">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <div className="text-8xl mb-4">✈️</div>
              <h3 className="text-white text-2xl font-bold mb-2">No trips yet</h3>
              <p className="text-gray-400 text-lg mb-8">Create your first adventure!</p>
            </div>
            <Button
              onClick={() => navigate('/create-trip')}
              className="px-10 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-bold"
            >
              Create Your First Trip ✨
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/20 hover:border-purple-500/50 transition-all"
              >
                {/* Trip Info */}
                <div className="mb-4">
                  <h3 className="text-white font-bold text-2xl mb-4">
                    {trip.destination.displayName}
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{trip.days} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span>{trip.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>{trip.tripType}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-3">
                      Created: {new Date(trip.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => navigate(`/trip/${trip._id}`)}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 rounded-xl py-3 font-semibold"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => deleteTrip(trip._id)}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-4 py-3"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create New Trip Button */}
        {trips.length > 0 && (
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/create-trip')}
              className="px-10 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-bold"
            >
              Create Another Trip ✨
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTrips;
