import React, { useState } from 'react';
import './SpotifyAccount.css';  // Assuming you have CSS for styling

function SpotifyAccount() {
  const [spotifyAccount, setSpotifyAccount] = useState('');

  const handleLink = (e) => {
    e.preventDefault();
    console.log('Spotify Account:', spotifyAccount);
    // Add logic to handle the account linking
  };

  const handleCancel = () => {
    // Add logic for canceling or redirecting
    console.log('Linking cancelled');
  };

  const handleNextStep = () => {
    // Redirect to the Country, State, City selection page
    window.location.href = '/location-selection';
  };

  return (
    <div className="spotify-account-container">
      <h1>iMusic</h1>
      <form onSubmit={handleLink}>
        <div className="form-group">
          <label htmlFor="spotifyAccount">Spotify Account</label>
          <input
            type="text"
            id="spotifyAccount"
            placeholder="Spotify Account"
            value={spotifyAccount}
            onChange={(e) => setSpotifyAccount(e.target.value)}
            required
          />
        </div>

        <div className="button-container">
          <button type="submit" className="link-button">Link</button>
          <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>

      {/* New Next Step button */}
      <button className="next-button" onClick={handleNextStep}>Next Step</button>

    </div>
  );
}

export default SpotifyAccount;