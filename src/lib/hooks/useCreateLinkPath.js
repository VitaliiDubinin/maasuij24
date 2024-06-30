// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';

// const createLinkPath = async (data) => {
//   // const response = await axios.post('/api/link-path/edit', data);
//   // return response.data;
//   console.log("test mu")
// };

// const useCreateLinkPath = () => {
//   const queryClient = useQueryClient();

//   return useMutation(createLinkPath, {
//     onSuccess: () => {
//       queryClient.invalidateQueries(['routes']);
//     },
//     onError: (error) => {
//       console.error("Error in useCreateLinkPath mutation:", error);
//     }
//   });
// };

// export default useCreateLinkPath;

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { updateEntityForm } from '../fetch';

const createLinkPath = async (data) => {
  console.log(data)
  // const response = await axios.post('/api/link-path/edit', data);

  const enroute = `/link-path/edit`;
  const response = await updateEntityForm(data, enroute);

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
