import React from "react";
import { memo, useMemo, useState } from "react";
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
  return {
    name: !validateRequired(entity.name) ? "Name is required" : "",
    abbreviation: !validateRequired(entity.abbreviation)
      ? "Abbreviation is required"
      : "",
    address: !validateRequired(entity.address) ? "Address is required" : "",
    active: !validateRequired(entity.active) ? "Active is required" : "",
    depot: !validateRequired(entity.depot) ? "Depot is required" : "",
  };
}

const Stops = () => {
  const transformTableToJson = (values) => {
    return {
      persistent: {
        id: values.id || null,
        name: values.name || null,
        description: values.description || null,
        creator: values.creator || null,
        locales: [],
        active: values.active || false,
      },
      number: values.number || null,
      abbreviation: values.abbreviation || null,
      address: values.address || null,
      depot: values.depot || false,
    };
  };

  const [validationErrors, setValidationErrors] = useState({});

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.persistent?.id,
        id: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorFn: (row) => row.number,
        id: "number",
        header: "Stop Number",
        enableEditing: false,
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
        accessorFn: (row) => row.persistent?.name,
        id: "name",
        header: "Stop name",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              name: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.abbreviation,
        id: "abbreviation",
        header: "Abbrevation",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.abbreviation,
          helperText: validationErrors?.abbreviation,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              abbreviation: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.address,
        id: "address",
        header: "Address",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.address,
          helperText: validationErrors?.address,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              address: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.persistent?.active,
        id: "active",
        header: "Active",
        Cell: ({ row }) => (
          <Checkbox checked={row.original.persistent?.active === true} />
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
        accessorFn: (row) => row.depot,
        id: "depot",
        header: "Depot",
        Cell: ({ row }) => <Checkbox checked={row.original.depot === true} />,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.depot,
          helperText: validationErrors?.depot,
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                depot: "Depot is required",
              }));
            } else if (value !== "true" && value !== "false") {
              setValidationErrors({
                ...validationErrors,
                depot: 'Depot is "true" or "false"',
              });
            } else {
              delete validationErrors.depot;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorFn: (row) => row.persistent?.description,
        id: "description",
        header: "Description",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.description,
          helperText: validationErrors?.description,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              description: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.persistent?.creator,
        id: "creator",
        header: "Creator",
        enableEditing: false,
        size: 80,
      },
    ],

    [validationErrors],
  );

  const { mutateAsync: createEntity, isPending: isCreatingEntity } =
    useCreateEntity();

  const {
    data: fetchedEntities = [],
    isError: isLoadingEntitiesError,
    isFetching: isFetchingEntities,
    isLoading: isLoadingEntities,
  } = useGetEntity();

  const { mutateAsync: updateEntity, isPending: isUpdatingEntity } =
    useUpdateEntity();
  const { mutateAsync: deleteEntity, isPending: isDeletingEntity } =
    useDeleteEntity();

  //CREATE action
  const handleCreateEntity = async ({ values, table }) => {
    console.log("from handleCreateEntity", { values });
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);

    await createEntity(transformedValues);

    table.setCreatingRow(null);
  };

  //UPDATE action
  const handleSaveEntity = async ({ values, table }) => {
    const newValidationErrors = validateEntity(values);

    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    await updateEntity(transformedValues);
    table.setEditingRow(null);
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Stop?")) {
      deleteEntity(row.original.persistent.id);
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
        <DialogTitle variant="h5">Create New Stop</DialogTitle>
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
        <DialogTitle variant="h5">Edit Stop</DialogTitle>
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
        Create New Stop
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newstop) => {
      const enroute = `/stop/create`;
      newstop.persistent.creator = 132;
      const response = await createEntityForm(newstop, enroute);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["stops"], (prevEntities) => {
        return prevEntities.map((entity) =>
          entity.persistent?.id === variables.persistent?.id
            ? { ...entity, "persistent.id": data.persistent.id }
            : entity,
        );
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["stops"] }),
  });
}

//READ hook (get Entities from api)
function useGetEntity() {
  return useQuery({
    queryKey: ["stops"],
    queryFn: async () => {
      const response = await getData(`stop/find-all`);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Entity in api)
function useUpdateEntity() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["stops"]);
  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (value) => value.persistent.id === entity.persistent.id,
      );
      if (cachedEntity) {
        entity.persistent.creator = cachedEntity.persistent.creator;
      }
      const enroute = `/stop/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["stops"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.persistent.id === newEntityInf.persistent.id
            ? newEntityInf
            : prevEntity,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["stops"] }),
  });
}

//DELETE hook (delete Entity in api)
function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entityId) => {
      const enroute = `/stop/`;

      const response = await deleteEntity(entityId, enroute);
      return response;
    },
    onMutate: (entityId) => {
      queryClient.setQueryData(["stops"], (prevEntities) =>
        prevEntities?.filter((entity) => entity.persistent.id !== entityId),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["stops"] }),
  });
}

export default memo(Stops);
