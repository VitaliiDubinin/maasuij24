import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEntity } from '../fetch';

const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entityId) => {
      console.log("from useDeleteHook", entityId);
      const enroute = `/stop-point/delete/`;
      await deleteEntity(entityId, enroute);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spoints']);
    }
  });
};

export default useDeleteEntity;



//import useCreateEntity from '../../../lib/hooks/useDeleteEntity';