import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEntityForm } from '../fetch';
import { fetchAndUpdateEntities } from './fetchAndUpdateEntities';

const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity) => {
      console.log(entity)
       const enroute = `/link/create`;
       const reqbody = {
        number: 44,
        startPointId: entity[0].id.slice(5),
        finishPointId: entity[1].id.slice(5),
        productive: true,
        stored: {
            id: null,
            creator: 138,
            active: true
        }     
    }

//    console.log(reqbody)

       const response = await createEntityForm(reqbody, enroute);
      return response;
    },
    onSuccess: async () => {
     console.log("useCreateEntity success, fetching new data");
   //   queryClient.invalidateQueries(['links']);
      //await fetchAndUpdateEntities(queryClient);
    },
    onError: (error) => {
      console.error("Error in useCreateEntity mutation:", error);
    }
  });
};

export default useCreateLink;



