import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';

function ViewTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/trips/${tripId}`
      );

      if (response.data.success) {
        setTrip(response.data.trip);
      } else {
        setError('Trip not found');
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/trips/${tripId}`
      );

      if (response.data.success) {
        alert('Trip deleted successfully!');
        navigate('/my-trips');
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{error || 'Trip not found'}</h2>
        <Button onClick={() => navigate('/my-trips')}>Back to My Trips</Button>
      </div>
    );
  }

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-bold text-3xl mb-2">
            {trip.destination.displayName}
          </h2>
          <div className="flex gap-4 text-gray-600">
            <span>📅 {trip.days} days</span>
            <span>💰 {trip.budget}</span>
            <span>👥 {trip.tripType}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/my-trips')}>
            Back
          </Button>
          <Button variant="destructive" onClick={deleteTrip}>
            Delete Trip
          </Button>
        </div>
      </div>

      {/* Itinerary Section */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-2xl font-bold mb-4">Trip Itinerary</h3>
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {trip.itinerary}
        </div>
      </div>

      {/* Trip Info Card */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3">Trip Information</h3>
        <div className="space-y-2 text-gray-700">
          <p><strong>Destination:</strong> {trip.destination.displayName}</p>
          <p><strong>Duration:</strong> {trip.days} days</p>
          <p><strong>Budget:</strong> {trip.budget}</p>
          <p><strong>Trip Type:</strong> {trip.tripType}</p>
          <p><strong>Created:</strong> {new Date(trip.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
      </div>
    </div>
  );
}

export default ViewTrip;
