import React, { useState } from 'react';
import './SpotifyAccount.css'; // Add CSS for styling

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
    </div>
  );
}

export default SpotifyAccount;