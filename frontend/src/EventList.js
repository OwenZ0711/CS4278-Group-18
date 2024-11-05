import React, { useState, useEffect } from 'react';
import './EventList.css';

function EventList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hardcoded artist images
  const artistPhotos = {
    'Taylor Swift': 'https://picsum.photos/60?random=1',
    'One Republic': 'https://picsum.photos/60?random=2',
    'Jay Chou': 'https://picsum.photos/60?random=3',
    'Milet': 'https://picsum.photos/60?random=4',
    'Ed Sheeran': 'https://picsum.photos/60?random=5',
    'BTS': 'https://picsum.photos/60?random=6',
    'Ariana Grande': 'https://picsum.photos/60?random=7',
    'The Weeknd': 'https://picsum.photos/60?random=8',
    'Billie Eilish': 'https://picsum.photos/60?random=9',
    'Drake': 'https://picsum.photos/60?random=10',
  };

  const [events, setEvents] = useState([
    // Hardcoded event data for demonstration
    { name: 'Taylor Swift Concert', artist: 'Taylor Swift', date: '2024-12-15', location: 'New York, NY' },
    { name: 'One Republic Live', artist: 'One Republic', date: '2024-11-20', location: 'Los Angeles, CA' },
    { name: 'Jay Chou World Tour', artist: 'Jay Chou', date: '2024-11-25', location: 'San Francisco, CA' },
    { name: 'Milet Acoustic Night', artist: 'Milet', date: '2024-12-05', location: 'Chicago, IL' },
    { name: 'Ed Sheeran Stadium Show', artist: 'Ed Sheeran', date: '2024-12-10', location: 'Miami, FL' },
    { name: 'BTS Fan Meeting', artist: 'BTS', date: '2024-12-18', location: 'Las Vegas, NV' },
    { name: 'Ariana Grande Special', artist: 'Ariana Grande', date: '2024-11-30', location: 'Seattle, WA' },
    { name: 'The Weeknd Arena Tour', artist: 'The Weeknd', date: '2024-12-20', location: 'Houston, TX' },
    { name: 'Billie Eilish Exclusive', artist: 'Billie Eilish', date: '2024-11-22', location: 'Austin, TX' },
    { name: 'Drake Festival', artist: 'Drake', date: '2024-11-28', location: 'Atlanta, GA' },
  ]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Database fetching logic (currently commented out)
  /*
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://api.example.com/events'); // Replace with your API URL
        if (!response.ok) {
          throw new Error('Failed to fetch event data');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchEvents();
  }, []);
  */

  // Sort and set filtered events on mount
  useEffect(() => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEvents(sortedEvents);
  }, [events]);

  // Filter events based on the search term
  useEffect(() => {
    const filtered = events.filter(event =>
      event.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered.sort((a, b) => new Date(a.date) - new Date(b.date)));
  }, [searchTerm, events]);

  return (
    <div className="event-list-page">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <ul>
          <li><a href="/event-list">My Event List</a></li>
          <li><a href="/my-artist">My Artist</a></li>
          <li><a href="/my-profile">My Profile</a></li>
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
          />
          <button onClick={() => setSearchTerm('')}>✖</button>
        </div>

        {/* Event List */}
        <div className="event-list">
          {filteredEvents.map((event, index) => (
            <div key={index} className="event-item">
              <img src={artistPhotos[event.artist]} alt={event.artist} className="event-photo" />
              <div className="event-info">
                <h2>{event.name}</h2> {/* Event Name as the title */}
                <p>Artist: {event.artist}</p> {/* Artist as the subtitle */}
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Location: {event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventList;