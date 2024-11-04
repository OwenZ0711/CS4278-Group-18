import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LocationSelection.css';

function LocationSelection() {
  const [locationData, setLocationData] = useState({
    country: 'US',
    state: 'Tennessee',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/location-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
  
      if (response.ok) {
        alert('Location saved successfully!');
  
        // the complete registration endpoint
        const completeResponse = await fetch('http://localhost:5000/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (completeResponse.ok) {
          alert('Registration completed successfully!');
          navigate('/login'); // Redirect to login after successful registration
        } else {
          const errorData = await completeResponse.json();
          alert(`Error: ${errorData.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert('There was an error connecting to the server.');
    }
  };

  return (
    <div className="location-selection-container">
      <h1>iMusic</h1>

      <form onSubmit={handleSubmit}>
        {/* Country Selection */}
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={locationData.country}
            onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
          >
            <option value="US">US</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        {/* State Selection */}
        <div className="form-group">
          <label htmlFor="state">State</label>
          <select
            id="state"
            value={locationData.state}
            onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
          >
            <option value="Alabama">Alabama</option>
            <option value="Alaska">Alaska</option>
            <option value="Arizona">Arizona</option>
            <option value="Arkansas">Arkansas</option>
            <option value="California">California</option>
            <option value="Colorado">Colorado</option>
            <option value="Connecticut">Connecticut</option>
            <option value="Delaware">Delaware</option>
            <option value="Florida">Florida</option>
            <option value="Georgia">Georgia</option>
            <option value="Hawaii">Hawaii</option>
            <option value="Idaho">Idaho</option>
            <option value="Illinois">Illinois</option>
            <option value="Indiana">Indiana</option>
            <option value="Iowa">Iowa</option>
            <option value="Kansas">Kansas</option>
            <option value="Kentucky">Kentucky</option>
            <option value="Louisiana">Louisiana</option>
            <option value="Maine">Maine</option>
            <option value="Maryland">Maryland</option>
            <option value="Massachusetts">Massachusetts</option>
            <option value="Michigan">Michigan</option>
            <option value="Minnesota">Minnesota</option>
            <option value="Mississippi">Mississippi</option>
            <option value="Missouri">Missouri</option>
            <option value="Montana">Montana</option>
            <option value="Nebraska">Nebraska</option>
            <option value="Nevada">Nevada</option>
            <option value="New Hampshire">New Hampshire</option>
            <option value="New Jersey">New Jersey</option>
            <option value="New Mexico">New Mexico</option>
            <option value="New York">New York</option>
            <option value="North Carolina">North Carolina</option>
            <option value="North Dakota">North Dakota</option>
            <option value="Ohio">Ohio</option>
            <option value="Oklahoma">Oklahoma</option>
            <option value="Oregon">Oregon</option>
            <option value="Pennsylvania">Pennsylvania</option>
            <option value="Rhode Island">Rhode Island</option>
            <option value="South Carolina">South Carolina</option>
            <option value="South Dakota">South Dakota</option>
            <option value="Tennessee">Tennessee</option>
            <option value="Texas">Texas</option>
            <option value="Utah">Utah</option>
            <option value="Vermont">Vermont</option>
            <option value="Virginia">Virginia</option>
            <option value="Washington">Washington</option>
            <option value="West Virginia">West Virginia</option>
            <option value="Wisconsin">Wisconsin</option>
            <option value="Wyoming">Wyoming</option>
          </select>
        </div>

        <button type="submit" className="finish-button">Finish!</button>
      </form>
    </div>
  );
}

export default LocationSelection;