import React, { memo, useMemo, useState } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import {
  getData,
  createEntityForm,
  updateEntityForm,
  deleteEntity,
} from "../../../lib/fetch";

const validateRequired = (value) =>
  value !== undefined && value !== null && value !== "";

function validateEntity(entity) {
  console.log(entity);
  return {
    number: !validateRequired(entity.number) ? "Number is required" : "",
    startPointId: !validateRequired(entity.startPointId)
      ? "Start Point ID is required"
      : "",
    finishPointId: !validateRequired(entity.finishPointId)
      ? "Finish Point ID is required"
      : "",
    active: !validateRequired(entity.active) ? "Active ID is required" : "",
    isProductive: !validateRequired(entity.isProductive)
      ? "Productive is required"
      : "",
  };
}

const Links = () => {
  const transformTableToJson = (values) => {
    console.log("Values", values);
    console.log("Values.creator", values.creator);
    return {
      number: values.number || null,
      startPointId: values.startPointId || null,
      finishPointId: values.finishPointId || null,
      isProductive: values.isProductive || false,
      stored: {
        id: values.storedId || null,
        active: values.active || false,
      },
    };
  };

  const [validationErrors, setValidationErrors] = useState({});

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.stored?.id,
        id: "storedId",
        header: "Stored ID",
        enableEditing: false,
        size: 80,
      },
      {
        accessorFn: (row) => row.number,
        id: "number",
        header: "Number",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.number,
          helperText: validationErrors?.number,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              number: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.startPointId,
        id: "startPointId",
        header: "Start Point Id",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.startPointId,
          helperText: validationErrors?.startPointId,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              startPointId: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.finishPointId,
        id: "finishPointId",
        header: "Finish Point Id",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.finishPointId,
          helperText: validationErrors?.finishPointId,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              finishPointId: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.isProductive,
        id: "isProductive",
        header: "Productive",
        Cell: ({ row }) => (
          <Checkbox checked={row.original.isProductive === true} />
        ),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.isProductive,
          helperText: validationErrors?.isProductive,
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                isProductive: "Productive is required",
              }));
            } else if (value !== "true" && value !== "false") {
              setValidationErrors({
                ...validationErrors,
                isProductive: 'Productive is "true" or "false"',
              });
            } else {
              delete validationErrors.isProductive;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },

      {
        accessorFn: (row) => row.stored?.active,
        id: "active",
        header: "Active",
        Cell: ({ row }) => (
          <Checkbox checked={row.original.stored?.active === true} />
        ),
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.active,
          helperText: validationErrors?.active,
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                active: "active is required",
              }));
            } else if (value !== "true" && value !== "false") {
              setValidationErrors({
                ...validationErrors,
                active: 'active is "true" or "false"',
              });
            } else {
              delete validationErrors.active;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },

      {
        accessorFn: (row) => row.stored?.creator,
        id: "creator",
        header: "Creator",
        enableEditing: false,
        size: 80,
      },
    ],
    [validationErrors],
  );
  //console.log(columns)
  //call CREATE hook
  const { mutateAsync: createEntity, isPending: isCreatingEntity } =
    useCreateEntity();

  const {
    data: fetchedEntities = [],
    isError: isLoadingEntitiesError,
    isFetching: isFetchingEntities,
    isLoading: isLoadingEntities,
  } = useGetEntity();
  //console.log('fetchedEntities', fetchedEntities)
  const { mutateAsync: updateEntity, isPending: isUpdatingEntity } =
    useUpdateEntity();
  const { mutateAsync: deleteEntity, isPending: isDeletingEntity } =
    useDeleteEntity();

  //CREATE action
  const handleCreateEntity = async ({ values, table }) => {
    console.log("from handleCreateEntity", values);
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    //console.log('transformedValues',transformedValues)
    await createEntity(transformedValues);

    table.setCreatingRow(null);
  };

  //UPDATE action
  const handleSaveEntity = async ({ values, table }) => {
    //console.log('from handleSaveEntity', values);
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      console.log(
        "error",
        Object.values(newValidationErrors).some((error) => error),
      );
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    console.log("transformedValues from Update", transformedValues);
    await updateEntity(transformedValues);
    table.setEditingRow(null);
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Link?")) {
      deleteEntity(row.original.stored.id);
      //deleteEntity(row.original.number);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedEntities,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingEntitiesError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateEntity,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveEntity,

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Create New Link</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Edit Link</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Create New Link
      </Button>
    ),
    state: {
      isLoading: isLoadingEntities,
      isSaving: isCreatingEntity || isUpdatingEntity || isDeletingEntity,
      showAlertBanner: isLoadingEntitiesError,
      showProgressBars: isFetchingEntities,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new Entity to api)
function useCreateEntity() {
  //console.log('useCreateEntity')
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newlink) => {
      console.log("original Entity from mutation", newlink);
      const enroute = `/link/create`;
      newlink.stored.creator = 132;
      const response = await createEntityForm(newlink, enroute);
      return response;
    },
    onSuccess: (data, variables) => {
      //console.log('onSuccess',{data, variables})
      queryClient.setQueryData(["links"], (prevEntities) => {
        //console.log('prevEntities',prevEntities)
        return prevEntities.map((entity) =>
          entity.stored?.id === variables.stored?.id
            ? { ...entity, "stored.id": data.stored.id }
            : entity,
        );
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
}

//READ hook (get Entities from api)
function useGetEntity() {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const response = await getData(`link/find-all`);
      console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Entity in api)
function useUpdateEntity() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["links"]);
  return useMutation({
    mutationFn: async (entity) => {
      /*
      const enroute = `/link/edit`;
      const response = await updateEntityForm(entity, enroute);*/

      const cachedEntity = cachedPointsData?.find(
        (value) => value.stored.id === entity.stored.id,
      );
      if (cachedEntity) {
        entity.stored.creator = cachedEntity.stored.creator;
      }
      const enroute = `/link/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["links"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.stored.id === newEntityInf.stored.id
            ? newEntityInf
            : prevEntity,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
}

//DELETE hook (delete Entity in api)
function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entityId) => {
      const enroute = `/link/`;
      const response = await deleteEntity(entityId, enroute);
      return response;
    },
    onMutate: (entityId) => {
      if (!entityId) {
        return;
      }
      queryClient.setQueryData(["links"], (prevEntities) =>
        prevEntities?.filter((entity) => entity.id !== entityId),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
}

export default memo(Links);
