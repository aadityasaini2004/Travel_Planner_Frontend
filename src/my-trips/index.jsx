import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/trips/${tripId}`
      );

      if (response.data.success) {
        alert("Trip deleted successfully!");
        fetchTrips(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">
          Please sign in to view your trips
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">
      <h2 className="font-bold text-3xl mb-8">My Trips 🗺️</h2>

      {trips.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-xl mb-5">No trips saved yet</p>
          <button
            onClick={() => navigate("/create-trip")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer"
            >
              <h3 className="font-bold text-xl mb-2">
                {trip.destination.displayName}
              </h3>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>📅 {trip.days} days</p>
                <p>💰 {trip.budget}</p>
                <p>👥 {trip.tripType}</p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(trip.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/trip/${trip._id}`)}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => deleteTrip(trip._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTrips;
