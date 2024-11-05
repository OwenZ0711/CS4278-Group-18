import React, { useState, useEffect } from 'react';
import './MyArtist.css';

function MyArtist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the list of artists from the backend endpoint
    const fetchArtists = async () => {
      try {
        const response = await fetch('http://localhost:5000/artist-list', {
          method: 'GET',
          credentials: "include",
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArtists(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Filter artists based on the search term
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="my-artist-page">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <ul>
          <li><a href="/event-list">My Event List</a></li>
          <li><a href="/my-artist">My Artist</a></li>
          <li><a href="/my-profile">My Profile</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="my-artist-container">
        <h1>My Artist</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Artist"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm('')}>✖</button>
        </div>

        {/* Loading and Error Handling */}
        {loading && <p>Loading artists...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Artist List with Scrollbar */}
        <div className="artist-list">
          {filteredArtists.map((artist, index) => (
            <div key={index} className="artist-item">
              <img src={artist.image || 'https://via.placeholder.com/150'} alt={artist.name} />
              <div className="artist-info">
                <h2>{artist.name}</h2>
                <p>{artist.description || 'No description available'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyArtist;
