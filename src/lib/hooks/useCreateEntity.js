import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEntityForm } from '../fetch';

const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spoint) => {
    console.log("from useCreateHook", spoint);
      const enroute = `/stop-point/create`;
     // spoint.persistent.creator = 132;
      const response = await createEntityForm(spoint, enroute);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["spoints"]);
    }
  });
};

export default useCreateEntity;


//import useCreateEntity from '../../../lib/hooks/useCreateEntity';