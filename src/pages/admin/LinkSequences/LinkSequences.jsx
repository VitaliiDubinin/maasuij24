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
  return {
    name: !validateRequired(entity.name) ? "Name is required" : "",
    active: !validateRequired(entity.active) ? "Active is required" : "",
  };
}

const LinkSequences = () => {
  const transformTableToJson = (values) => {
    console.log("Values:", values);
    return {
      persistent: {
        id: values.id || null,
        name: values.name || null,
        description: values.description || null,
        creator: values.creator || null,
        active: values.active || false,
        locales: [],
      },
      linkPaths: values.linkPaths || [],
    };
  };

  const [validationErrors, setValidationErrors] = useState({});

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.persistent?.id,
        id: "id",
        header: "ID",
        enableEditing: false,
        size: 80,
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
        accessorFn: (row) => row.persistent?.description,
        id: "description",
        header: "Description",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.persistent?.description,
          helperText: validationErrors?.persistent?.description,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              persistent: {
                ...prevErrors.persistent,
                description: undefined,
              },
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
        accessorFn: (row) => row.linkPaths,
        id: "linkPaths",
        header: "Link Paths",
        enableEditing: false,
        Cell: ({ row }) => {
          const linkPaths = row.original.linkPaths;
          return (
            <div>
              {linkPaths.length > 0
                ? <><span style={{ fontWeight: 'bold' }}>LP:</span> {linkPaths.map((path) => `ID ${path.linkId}`).join(", ")}</>
                : "No Link Paths"}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.persistent?.creator,
        id: 'creator',
        header: 'Creator',
        enableEditing: false,
        size: 80,
      },
      /*
      {
        accessorFn: (row) => row.persistent?.locales,
        id: "locales",
        header: "Locales",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.persistent?.locales,
          helperText: validationErrors?.persistent?.locales,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              persistent: {
                ...prevErrors.persistent,
                locales: undefined,
              },
            })),
        },
      },*/
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

  const handleCreateEntity = async ({ values, table }) => {
    console.log("Creating entity with values:", values);
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

  const handleSaveEntity = async ({ values, table }) => {
    console.log("Saving entity with values:", values);
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

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Link Sequence?")) {
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
        <DialogTitle variant="h5">Create New Link Sequence</DialogTitle>
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
        <DialogTitle variant="h5">Edit Link Sequence</DialogTitle>
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
      <Button variant="contained" onClick={() => table.setCreatingRow(true)}>
        Create New Link Sequence
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

function useGetEntity() {
  return useQuery({
    queryKey: ["linkSequences"],
    queryFn: async () => {
      const response = await getData(`link_sequence/find-all`);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntity) => {
      console.log("Creating entity with data:", newEntity);
      const enroute = `/link_sequence/create`;
      newEntity.persistent.creator = 132;
      try {
        const response = await createEntityForm(newEntity, enroute);
        console.log("Create response:", response);
        return response;
      } catch (error) {
        if (error.response) {
          console.error(
            "Server responded with a status:",
            error.response.status,
          );
          console.error("Response data:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error", error.message);
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["linkSequences"], (prevEntities) => {
        return prevEntities.map((entity) =>
          entity.persistent?.id === variables.persistent?.id
            ? { ...entity, "persistent.id": data.persistent.id }
            : entity,
        );
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["linkSequences"] }),
  });
}

function useUpdateEntity() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["linkSequences"]);
  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (point) => point.persistent.id === entity.persistent.id,
      );
      if (cachedEntity) {
        entity.persistent.creator = cachedEntity.persistent.creator;
      }
      const enroute = `/link_sequence/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntity) => {
      queryClient.setQueryData(["linkSequences"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.id === newEntity.persistent.id ? newEntity : prevEntity,
        ),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["linkSequences"] }),
  });
}

function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entityId) => {
      const enroute = `/link_sequence/`;
      const response = await deleteEntity(entityId, enroute);
      return response;
    },
    onMutate: (entityId) => {
      if (!entityId) {
        return;
      }
      queryClient.setQueryData(["linkSequences"], (prevEntities) =>
        prevEntities?.filter((entity) => entity.persistent.id !== entityId),
      );
    },
  });
}

export default memo(LinkSequences);
