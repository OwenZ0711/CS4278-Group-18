import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ArtistDetails.css';

function ArtistDetails() {
  const { artistName } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/artist-details/${artistName}`, {
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

  // return (
  //   <div className="artist-details-page">
  //     <div className="artist-header">
  //       <img src={artist.image || 'https://via.placeholder.com/150'} alt={artist.name} className="artist-photo" />
  //       <div className="artist-info">
  //         <h1>{artist.name}</h1>
  //         <p>{artist.description}</p>
  //       </div>
  //     </div>
  //     <div className="artist-events">
  //       <h2>Upcoming Events</h2>
  //       {events.length > 0 ? (
  //         events.map((event, index) => (
  //           <div key={index} className="event-item">
  //             <h3>{event.name}</h3>
  //             <p>Date: {new Date(event.date).toLocaleDateString()}</p>
  //             <p>Location: {event.location}</p>
  //           </div>
  //         ))
  //       ) : (
  //         <p>No upcoming events for this artist.</p>
  //       )}
  //     </div>
  //   </div>
  // );
  return (
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
  );
}

export default ArtistDetails;