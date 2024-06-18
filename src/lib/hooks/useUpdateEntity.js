import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEntityForm } from '../fetch';

const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity) => {
      console.log("from useUpdateHook entity", entity);
    //   await queryClient.invalidateQueries(["spoints"]);
    //   const cachedPointsData = queryClient.getQueryData(["spoints"]);
    // //  console.log("from useUpdateHook cachedPointsData", cachedPointsData);

    //   if (!entity.persistent || !entity.persistent.id) {
    //     console.error("Entity or entity.persistent.id is undefined", entity);
    //     throw new Error("Entity or entity.persistent.id is undefined");
    //   }

    //   const cachedEntity = cachedPointsData?.features?.find(
    //     (point) => point.properties.id === entity.persistent.id,
    //   );
    //   if (!cachedEntity) {
    //     console.error("No cached entity found for id", entity.persistent.id);
    //     throw new Error("No cached entity found");
    //   }

    //   // Merge the cached entity data with the new coordinates
    //   const updatedEntity = {
    //     ...cachedEntity,
    //     geometry: {
    //       type: "Point",
    //       coordinates: [entity.point.x, entity.point.y],
    //     },
    //     properties: {
    //       ...cachedEntity.properties,
    //       ...entity.persistent,
    //     }
    //   };

    const modifiedEntity = {
      ...entity,
      persistent: {
        ...entity.persistent,
        id: entity.persistent.id.replace("point", ""),
      }
    };



      const enroute = `/stop-point/edit`;
    //  console.log("Calling updateEntityForm with:", updatedEntity, enroute);
      console.log("Calling updateEntityForm with:", modifiedEntity, enroute);
//      const response = await updateEntityForm(updatedEntity, enroute);
      const response = await updateEntityForm(modifiedEntity, enroute);
      console.log("Response from updateEntityForm:", response);
      return response;
    },
    onSuccess: () => {
      console.log("useUpdateEntity success, invalidating queries");
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
