import React, { useState, useMemo, memo } from "react";
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
  Checkbox,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getData,
  createEntityForm,
  updateEntityForm,
  deleteEntity,
} from "../../../lib/fetch";

const validateRequired = (value) =>
  value !== undefined && value !== null && value !== "";

function validateEntity(entity) {
  //console.log(entity.number);
  return {
    number: !validateRequired(entity.number) ? "Number is required" : "",
    linkId: !validateRequired(entity.linkId) ? "Link ID is required" : "",
    active: !validateRequired(entity.active) ? "Active ID is required" : "",
  };
}

const LinkPathes = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const transformTableToJson = (values) => {
    console.log("from transformTableToJson", values);
    return {
      number: values.number || null,
      linkId: values.linkId || null,
      stored: {
        id: values.storedId || null,
        creator: values.creator || null,
        active: values.active ?? true,
      },
      linkPoints:
        values.linkPoints?.map((point) => ({
          number: point.number || null,
          linkPathId: point.linkPathId || null,
          stored: {
            id: point.id || null,
            creator: point.creator || 10,
            active: point.active ?? true,
          },
          LinkPoint: {
            x: point.LinkPoint?.x || null,
            y: point.LinkPoint?.y || null,
          },
        })) || [],
    };
  };

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
        accessorFn: (row) => row.linkId,
        id: "linkId",
        header: "Link ID",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.linkId,
          helperText: validationErrors?.linkId,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              linkId: undefined,
            })),
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

  const {
    data: fetchedEntities = [],
    isError: isLoadingEntitiesError,
    isFetching: isFetchingEntities,
    isLoading: isLoadingEntities,
  } = useGetEntity();

  const { mutateAsync: createEntity, isPending: isCreatingEntity } =
    useCreateEntity();
  const { mutateAsync: updateEntity, isPending: isUpdatingEntity } =
    useUpdateEntity();
  const { mutateAsync: deleteEntity, isPending: isDeletingEntity } =
    useDeleteEntity();

  //CREATE action:
  const handleCreateEntity = async ({ values, table }) => {
    //console.log('from handleCreateEntity', values)
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    console.log("transformedValues", transformedValues);

    await createEntity(transformedValues);

    table.setCreatingRow(null);
  };

  //UPDATE action:
  const handleSaveEntity = async ({ values, table }) => {
    //console.log(values);
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    //console.log('transformedValues',transformedValues)
    await updateEntity(transformedValues);
    table.setEditingRow(null);
  };

  //DELETE action:
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Link Path?")) {
      deleteEntity(row.original.stored.id);
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
        <DialogTitle variant="h5">Create New Link Path</DialogTitle>
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
        <DialogTitle variant="h5">Edit Link Path</DialogTitle>
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
        Create New Link Path
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
    mutationFn: async (newLinkPath) => {
      const enroute = `/link-path/create`;
      newLinkPath.stored.creator = 132;
      const response = await createEntityForm(newLinkPath, enroute);
      return response;
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(["linkpathes"], (prevEntities) => {
        return prevEntities.map((entity) =>
          entity.stored?.id === variables.stored?.id
            ? { ...entity, "stored.id": data.stored.id }
            : entity,
        );
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["linkpathes"] }),
  });
}

//READ hook (get Entities from api)
function useGetEntity() {
  return useQuery({
    queryKey: ["linkpathes"],
    queryFn: async () => {
      const response = await getData(`link-path/find-all`);
      //console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Entity in api)
function useUpdateEntity() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["linkpathes"]);
  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (point) => point.stored.id === entity.stored.id,
      );

      if (cachedEntity) {
        entity.stored.creator = cachedEntity.stored.creator;
      }
      const enroute = `/link-path/edit`;

      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    //client side optimistic update
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["linkpathes"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.id === newEntityInf.id ? newEntityInf : prevEntity,
        ),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["linkpathes"] }),
  });
}

//DELETE hook (delete Entity in api)
function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entityId) => {
      const enroute = `/link-path/`;
      const response = await deleteEntity(entityId, enroute);
      return response;
    },
    onMutate: (entityId) => {
      if (!entityId) {
        return;
      }
      queryClient.setQueryData(["linkpathes"], (prevEntities) =>
        prevEntities?.filter((entity) => entity.id !== entityId),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["linkpathes"] }),
  });
}

export default memo(LinkPathes);
