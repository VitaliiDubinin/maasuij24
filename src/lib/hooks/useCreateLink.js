import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEntityForm } from '../fetch';
import { fetchAndUpdateEntities } from './fetchAndUpdateEntities';

const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity) => {
      const enroute = `/link/create`;
      const response = await createEntityForm(entity, enroute);
      return response;
    },
    onSuccess: async () => {
  //    console.log("useCreateEntity success, fetching new data");
      queryClient.invalidateQueries(['links']);
      //await fetchAndUpdateEntities(queryClient);
    },
    onError: (error) => {
      console.error("Error in useCreateEntity mutation:", error);
    }
  });
};

export default useCreateLink;



