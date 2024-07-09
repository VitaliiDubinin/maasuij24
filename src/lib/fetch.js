
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
//console.log(requestBody)
    const headers = {
      "Content-Type": "application/json",
      api_key: apiKey,
    };

    const response = await axios.post(`${baseUrl}${enroute}`, requestBody, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Error during creating Entity ${enroute}:`, error);
    throw error;
  }
};

// export const createEntityForm = async (newent, enroute) => {
//   try {
//     const requestBody = JSON.stringify(newent);
//     const headers = {
//       "Content-Type": "application/json",
//       api_key: apiKey,
//     };

//     const response = await axios.post(`${baseUrl}${enroute}`, requestBody, { headers });
//     return response.data;
//   } catch (error) {
//     if (error.response && error.response.status === 409) {
//       console.log("409 Conflict, treating as normal response:", error.response.data.message);
//       return error.response.data; // Return the response data instead of throwing the error
//     } else {
//       console.error("Error creating entity:", error);
//       throw error; // Re-throw the error if it's not a 409
//     }
//   }
// };

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
//    console.log("DELETE Request Response:", response.data);
    return response.data;
  } catch (error) {
    // console.error('Error updating stop point:', error);
    throw error;
  }
}

