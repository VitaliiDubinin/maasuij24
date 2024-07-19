import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEntityForm } from '../api/fetch';

const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity) => {

    const modifiedEntity = {
      ...entity,
      persistent: {
        ...entity.persistent,
        id: entity.persistent.id.replace("point", ""),
      }
    };

      const enroute = `/stop-point/edit`;
      const response = await updateEntityForm(modifiedEntity, enroute);

      return response;
    },
    onSuccess: () => {

      queryClient.invalidateQueries(["spoints"]).then(() => {
        queryClient.refetchQueries(["spoints"]);
      });
    },
    onError: (error) => {
      console.error("Error in useUpdateEntity mutation:", error);
    }
  });
};

export default useUpdateEntity;
