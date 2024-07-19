import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEntityForm } from '../api/fetch';

const createLinkPath = async (data) => {

  const enroute = `/link-path/create`;

  const response = await createEntityForm(data, enroute);

  return response;
};

export const useCreateLinkPath = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLinkPath,
    onSuccess: () => {
      queryClient.invalidateQueries(['routes']);
    },
  });
};
