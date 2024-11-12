import React from 'react';
import { useParams } from 'react-router-dom';
import './ArtistDetails.css';

function ArtistDetails() {
  const { artistName } = useParams();
  const [artist, setArtist] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/artist-details/${artistName}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArtist(data.artist);
        setEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistDetails();
  }, [artistName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!artist) {
    return <div>Artist not found</div>;
  }

  return (
    <div className="artist-details-page">
      <div className="artist-header">
        <img src={artist.image} alt={artist.name} className="artist-photo" />
        <div className="artist-info">
          <h1>{artist.name}</h1>
          <p>{artist.description}</p>
        </div>
      </div>
      <div className="artist-events">
        <h2>Upcoming Events</h2>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event-item">
              <h3>{event.name}</h3>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>
            </div>
          ))
        ) : (
          <p>No upcoming events for this artist.</p>
        )}
      </div>
    </div>
  );
}

export default ArtistDetails;