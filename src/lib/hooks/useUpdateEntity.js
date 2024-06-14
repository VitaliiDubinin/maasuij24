import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEntityForm } from '../fetch';

const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity) => {
      const cachedPointsData = queryClient.getQueryData(["spoints"]);
      console.log("from useUpdateHook cachedPointsData", cachedPointsData);

      if (!entity.persistent || !entity.persistent.id) {
        console.error("Entity or entity.persistent.id is undefined", entity);
        throw new Error("Entity or entity.persistent.id is undefined");
      }

      const cachedEntity = cachedPointsData?.features?.find(
        (point) => point.properties.id === entity.persistent.id,
      );
      if (cachedEntity) {
        entity.persistent.creator = cachedEntity.properties.creator;
      }
      const enroute = `/stop-point/edit`;
      console.log("Calling updateEntityForm with:", entity, enroute);
      const response = await updateEntityForm(entity, enroute);
      console.log("Response from updateEntityForm:", response);
      return response;
    },
    onMutate: (newEntityInf) => {
      console.log("onMutate called with:", newEntityInf);
      queryClient.setQueryData(["spoints"], (prevEntities) => {
        if (!prevEntities || !Array.isArray(prevEntities.features)) {
          console.error("Expected prevEntities.features to be an array, but got:", prevEntities);
          return prevEntities;
        }
        return {
          ...prevEntities,
          features: prevEntities.features.map((prevEntity) =>
            prevEntity.properties.id === newEntityInf.persistent.id
              ? {
                  ...prevEntity,
                  properties: {
                    ...prevEntity.properties,
                    ...newEntityInf.persistent,
                  },
                  geometry: newEntityInf.point,
                }
              : prevEntity,
          ),
        };
      });
    },
    onSuccess: () => {
      console.log("useUpdateEntity success, invalidating queries");
      queryClient.invalidateQueries(["spoints"]);
    },
    onError: (error) => {
      console.error("Error in useUpdateEntity mutation:", error);
    }
  });
};

export default useUpdateEntity;
