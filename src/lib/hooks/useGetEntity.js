// hooks/useGetEntity.js
import { useQuery } from '@tanstack/react-query';
import { getData } from '../fetch';

export const useGetEntity = () => {
  return useQuery({
    queryKey: ['spoints'],
    queryFn: async () => {
      const response = await getData('stop-point/find-all');
      console.log(response)
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

//import { useGetEntity } from '../../../lib/hooks/useGetEntity';