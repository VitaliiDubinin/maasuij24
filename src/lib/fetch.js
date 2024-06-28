
import axios from "axios";

const apiKey = process.env.REACT_APP_BE_API_KEY;
const baseUrl = process.env.REACT_APP_BE_API_URL;


export const getData = async (endpoint) => {
  const response = await axios.get(`${baseUrl}/${endpoint}`, {
    headers: { "Content-Type": "application/json", api_key: apiKey },
  });
  return response;
};

export const createEntityForm = async (newent, enroute) => {
  try {
   const requestBody = JSON.stringify(newent);
   //const requestBody = newent;
console.log(requestBody)
    const headers = {
      "Content-Type": "application/json",
      api_key: apiKey,
    };

    const response = await axios.post(`${baseUrl}${enroute}`, requestBody, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating stop point:", error);
    throw error;
  }
};

export async function updateEntityForm(values, enroute) {
  try {
    const requestBody = JSON.stringify(values);

    const headers = {
      "Content-Type": "application/json",
      api_key: apiKey,
    };

    const response = await axios.put(`${baseUrl}${enroute}`, requestBody, {
      headers,
    });

    return response.data;
  } catch (error) {
    // console.error('Error updating stop point:', error);
    throw error;
  }
}

export async function deleteEntity(entityId, enroute) {
  try {
    const headers = {
      "Content-Type": "application/json",
      api_key: apiKey,
    };

    const response = await axios.delete(`${baseUrl}${enroute}${entityId}`, {
      headers,
    });
    console.log("DELETE Request Response:", response.data);
    return response.data;
  } catch (error) {
    // console.error('Error updating stop point:', error);
    throw error;
  }
}

