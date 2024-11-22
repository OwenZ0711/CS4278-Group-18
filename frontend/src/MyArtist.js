import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyArtist.css';

function MyArtist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleArtistClick = (artistName) => {
    navigate(`/artist-details/${artistName}`);
  };

  // Filter artists based on the search term
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="my-artist-container">
        <h1>My Artist</h1>
        {loading && <p>Loading artists...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Artist"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm('')}>✖</button>
        </div>

        {/* Artist List with Scrollbar */}
        <div className="artist-list">
          {filteredArtists.map((artist, index) => (
            <div key={index} className="artist-item" onClick={() => handleArtistClick(artist.name)}>
              <img src={artist.image || 'https://via.placeholder.com/150'} alt={artist.name} className="artist-photo"/>
              <div className="artist-info">
                <h2>{artist.name}</h2>
                {/* <p>{artist.description || 'No description available'}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyArtist;
