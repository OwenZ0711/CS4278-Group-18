import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EventList.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch events from the backend on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/event-list', {
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
        setEvents(data);
        setFilteredEvents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term
  useEffect(() => {
    const filtered = events.filter(event =>
      event["Artist Name"] && event["Artist Name"].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleViewArtist = (artistName) => {
    // Navigate to the artist page
    navigate(`/my-artist?artist=${encodeURIComponent(artistName)}`);
  };

  return (
    <div className="event-list-page">
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
      <div className="event-list-container">
        <h1>My Event List</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Artist"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search-artist"
            name="search-artist"
          />
          <button onClick={() => setSearchTerm('')}>✖</button>
        </div>
        {loading && <p>Loading events...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="event-list">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <div key={index} className="event-item">
                <img 
                  src={'https://picsum.photos/60?random=' + (index + 11)} 
                  alt={event["Artist Name"] || 'Unknown Artist'} 
                  className="event-photo" 
                />
                <div className="event-info">
                  <h2>{event["Event Name"]}</h2>
                  <p>Artist: <span className="clickable-artist" onClick={() => handleViewArtist(event["Artist Name"])}>{event["Artist Name"]}</span></p>
                  <p>Location: {event.Location}</p>
                  <p>Date: {event["Event Date"] ? new Date(event["Event Date"]).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            ))
          ) : (
            !loading && <p>No events found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventList;
