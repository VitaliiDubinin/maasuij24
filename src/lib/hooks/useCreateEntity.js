import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEntityForm } from '../fetch';
import { fetchAndUpdateEntities } from './fetchAndUpdateEntities';

const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity) => {
      const enroute = `/stop-point/create`;
      const response = await createEntityForm(entity, enroute);
      return response;
    },
    onSuccess: async () => {
  //    console.log("useCreateEntity success, fetching new data");
      queryClient.invalidateQueries(['spoints']);
      //await fetchAndUpdateEntities(queryClient);
    },
    onError: (error) => {
      console.error("Error in useCreateEntity mutation:", error);
    }
  });
};

export default useCreateEntity;
