import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEntityForm } from '../fetch';

const useUpdateEntity = () => {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["spoints"]);

  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (point) => point.persistent.id === entity.persistent.id,
      );
      if (cachedEntity) {
        entity.persistent.creator = cachedEntity.persistent.creator;
      }
      const enroute = `/stop-point/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["spoints"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.id === newEntityInf.persistent.id
            ? newEntityInf
            : prevEntity,
        ),
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["spoints"]);
    }
  });
};

export default useUpdateEntity;


