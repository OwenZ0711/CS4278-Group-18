import React, { useState, useEffect } from 'react';
import './EventList.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="event-list-page">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <ul>
          <li><a href="/my-artist">My Artist</a></li>
          <li><a href="/event-list">My Event List</a></li>
          <li><a href="/my-profile">My Profile</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="event-list-container">
        <h1>My Event List</h1>
        {loading && <p>Loading events...</p>}
        {error && <p className="error">{error}</p>}
        <div className="event-list">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={index} className="event-item">
                <h2>{event["Event Name"]}</h2>
                <p>Artist: {event["Artist Name"]}</p>
                <p>Location: {event.Location}</p>
                <p>Date: {event["Event Date"]}</p>
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
