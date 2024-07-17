import { useMutation } from '@tanstack/react-query';
import { createEntityForm } from '../fetch';


const useCreateLink = () => {


  return useMutation({
    mutationFn: async (entity) => {
       const enroute = `/link/create`;
       const reqbody = {
        number: null,
        startPointId: entity[0].properties.id.slice(5),
        finishPointId: entity[1].properties.id.slice(5),
        productive: true,
        stored: {
            id: null,
            creator: 138,
            active: true
        }     
    }



      const response = await createEntityForm(reqbody, enroute);
//      console.log("created Link ID",response)
     return response;
      // try {
      //   const response = await createEntityForm(reqbody, enroute);
      //   console.log("created Link ID", response);
      //  return response;
      // }
      //  catch (error)
      // {
      //   if (error.response && error.response.status === 409) {
      //     console.log("409 Conflict, treating as normal response:", error.response.data.message);
      //     return error.response;
      //   } else {
      //     throw error;
      //   }
      // }

    },
    onSuccess: async () => {
     console.log("useCreateLink success, fetching new data");
   //   queryClient.invalidateQueries(['links']);
      //await fetchAndUpdateEntities(queryClient);
    },
    onError: (error) => {
      console.error("Error in useCreateEntity mutation:", error);
    }
  });
};

export default useCreateLink;



