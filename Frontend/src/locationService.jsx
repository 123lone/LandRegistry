// src/locationService.js

const API_ENDPOINT = 'https://api.countrystatecity.in/v1/countries/IN';

// NOTE: This public API key is for demonstration from a public GitHub repo.
// For production, you should get your own key from countrystatecity.in.
const API_KEY = 'X-CSCAPI-KEY'; // Replace with a real key for production

const headers = new Headers();
headers.append("X-CSCAPI-KEY", API_KEY);

const requestOptions = {
   method: 'GET',
   headers: headers,
   redirect: 'follow'
};

export const fetchStates = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/states`, requestOptions);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.sort((a, b) => a.name.localeCompare(b.name)); // Sort states alphabetically
  } catch (error) {
    console.error("Failed to fetch states:", error);
    return []; // Return empty array on error
  }
};

export const fetchCities = async (stateIso2) => {
  if (!stateIso2) return [];
  try {
    const response = await fetch(`${API_ENDPOINT}/states/${stateIso2}/cities`, requestOptions);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.sort((a, b) => a.name.localeCompare(b.name)); // Sort cities alphabetically
  } catch (error) {
    console.error(`Failed to fetch cities for state ${stateIso2}:`, error);
    return [];
  }
};