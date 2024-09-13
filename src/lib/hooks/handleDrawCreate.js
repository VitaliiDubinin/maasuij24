// handleDrawCreate.js
export const handleDrawCreate = (e, spointsData, createEntity, queryClient, map, draw) => {
    console.log("pointsData in handleDrawCreate", spointsData)
    const newFeature = e.features[0];
    const geometryType = newFeature.geometry.type;
  
    if (geometryType === 'Point') {
      const pointName = prompt("Enter a name for the new point:", "New Point");
  
      if (pointName) {
        const newSPoint = {
          persistent: {
            id: null,
            name: pointName,
            description: null,
            creator: "9e39d679-6267-4698-9859-db6bd20770d7",
            locales: [],
            active: null
          },
          number: null,
          point: {
            x: newFeature.geometry.coordinates[0],
            y: newFeature.geometry.coordinates[1]
          }
        };
  
        createEntity.mutate(newSPoint, {
          onSuccess: async (data) => {
            await queryClient.invalidateQueries(['spoints']);
            await queryClient.refetchQueries(['spoints']);
            const updatedPointsData = queryClient.getQueryData(['spoints']);
            console.log("updatedPointsData", updatedPointsData);
  
            if (map.current && map.current.getSource('points')) {
              map.current.getSource('points').setData(updatedPointsData);
            }
            draw.current.delete(newFeature.id);
          }
        });
      } else {
        draw.current.delete(newFeature.id);
      }
    }
  };
  