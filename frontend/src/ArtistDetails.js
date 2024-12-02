import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './ArtistDetails.css';

function ArtistDetails() {
  const { artistName } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await fetch(`https://backendtest3-b4ff149de3c9.herokuapp.com/artist-details/${artistName}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArtist(data);
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
    <div className="my-artist-page">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <ul>
          <li className={location.pathname === '/my-artist' ? 'active' : ''}>
            <a href="/my-artist">My Artist</a>
          </li>
          <li className={location.pathname === '/event-list' ? 'active' : ''}>
            <a href="/event-list">My Event List</a>
          </li>
          <li className={location.pathname === '/my-profile' ? 'active' : ''}>
            <a href="/my-profile">My Profile</a>
          </li>
        </ul>
      </nav>
      
      {/* Main Content */}
      <div className="artist-details-page">
        {loading ? (
          <p>Loading artist details...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="artist-header">
              <img src={artist.image || 'https://via.placeholder.com/150'} alt={artist.name} className="artist-photo" />
              <h1>{artist.name}</h1>
            </div>
            <div className="artist-events">
              <h2>Upcoming Events</h2>
              {artist.events.length > 0 ? (
                artist.events.map((event, index) => (
                  <div key={index} className="event-item">
                    <h3>{event["Event Name"]}</h3>
                    <p>Location: {event.Location}</p>
                    <p>Date: {event["Event Date"]}</p>
                  </div>
                ))
              ) : (
                <p>No upcoming events for this artist.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


export default ArtistDetails;