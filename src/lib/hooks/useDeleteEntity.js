import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEntity } from '../fetch';

const useDeleteEntity = () => {
  const queryClient = useQueryClient();
//  console.log("from useDeleteHook");

  return useMutation({
    mutationFn: async (entityId) => {
      console.log("from useDeleteHook", entityId);
      const enroute = `/stop-point/`;

//      await deleteEntity(entityId, enroute);
const id = entityId.replace('point', ''); // Remove the "point" prefix
await deleteEntity(id, enroute);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spoints']);
    }
  });
};

export default useDeleteEntity;



//import useCreateEntity from '../../../lib/hooks/useDeleteEntity';