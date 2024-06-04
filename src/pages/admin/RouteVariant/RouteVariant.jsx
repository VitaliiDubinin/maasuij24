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
    number: !validateRequired(entity.number) ? "Number is required" : "",
    description: !validateRequired(entity.description)
      ? "Description is required"
      : "",
    straightDirectionLinkSequenceId: !validateRequired(
      entity.straightDirectionLinkSequenceId,
    )
      ? "Straight Direction is required"
      : "",
    reverseDirectionLinkSequenceId: !validateRequired(
      entity.reverseDirectionLinkSequenceId,
    )
      ? "Reverse Direction is required"
      : "",
    depotExitLinkId: !validateRequired(entity.depotExitLinkId)
      ? "Depot Exit Link Id is required"
      : "",
    depotEntryLinkId: !validateRequired(entity.depotEntryLinkId)
      ? "Depot Entry Link Id is required"
      : "",
    routeId: !validateRequired(entity.routeId)
      ? "Depot Entry Link Id is required"
      : "",
    active: !validateRequired(entity.active) ? "Active is required" : "",
  };
}

const RouteVariant = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const transformTableToJson = (values) => {
    console.log("Transformed JSON:", values);
    return {
      number: values.number || null,
      description: values.description || null,
      straightDirectionLinkSequenceId:
        values.straightDirectionLinkSequenceId || null,
      reverseDirectionLinkSequenceId: values.reverseDirectionLinkSequenceId || null,
      depotExitLinkId: values.depotExitLinkId || null,
      depotEntryLinkId: values.depotEntryLinkId || null,
      routeId: values.routeId || null,
      stored: {
        id: values.id || null,
        creator: values.creator || null,
        active: values.active || false,
      },
    };
  };
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.stored?.id,
        id: "id",
        header: "Stored Id",
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
        accessorFn: (row) => row.description,
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
        accessorFn: (row) => row.straightDirectionLinkSequenceId,
        id: "straightDirectionLinkSequenceId",
        header: "Straight Direction",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.straightDirectionLinkSequenceId,
          helperText: validationErrors?.straightDirectionLinkSequenceId,
          /*
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              straightDirectionLinkSequenceId: undefined,
            }),
            */
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              straightDirectionLinkSequenceId: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.reverseDirectionLinkSequenceId,
        id: "reverseDirectionLinkSequenceId",
        header: "Reverse Direction",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.reverseDirectionLinkSequenceId,
          helperText: validationErrors?.reverseDirectionLinkSequenceId,
          /*
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              reverseDirectionSequenceId: undefined,
            }),
            */
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              reverseDirectionLinkSequenceId: undefined,
            })),
        },
      },
      {
        accessorFn: (row) => row.depotExitLinkId,
        id: "depotExitLinkId",
        header: "Depot Exit",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.depotExitLinkId,
          helperText: validationErrors?.depotExitLinkId,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              depotExitLinkId: undefined,
            }),
        },
      },
      {
        accessorFn: (row) => row.depotEntryLinkId,
        id: "depotEntryLinkId",
        header: "Depot Entry",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.depotEntryLinkId,
          helperText: validationErrors?.depotEntryLinkId,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              depotEntryLinkId: undefined,
            }),
        },
      },
      {
        accessorFn: (row) => row.routeId,
        id: "routeId",
        header: "Route Id",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.routeId,
          helperText: validationErrors?.routeId,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              routeId: undefined,
            }),
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
      /*
      {
        accessorFn: (row) => row.stored?.creator,
        id: "creator",
        header: "Creator",
        enableEditing: false,
        size: 80,
      },
      */
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

  const handleCreateEntity = async ({ values, table }) => {
    console.log("from handleCreateEntity", { values });
    const newValidationErrors = validateEntity(values);
    console.log("newValidationErrors", newValidationErrors);
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
    if (window.confirm("Are you sure you want to delete this route variant?")) {
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
        <DialogTitle variant="h5">Create New Route Variant</DialogTitle>
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
        <DialogTitle variant="h5">Edit Route Variant</DialogTitle>
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
        Create New Route Variant
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

// Get all route variants:
function useGetEntity() {
  return useQuery({
    queryKey: ["routevariants"],
    queryFn: async () => {
      const response = await getData("route/route-variant/find-all");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

// Create new route variant:
function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newrouteVar) => {
      const enroute = `/route/route-variant/create`;
      newrouteVar.stored.creator = 132;
      const response = await createEntityForm(newrouteVar, enroute);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["routevariants"], (prevEntities) => {
        return prevEntities.map((entity) =>
          entity.stored?.id === variables.stored?.id
            ? { ...entity, "stored.id": data.stored.id }
            : entity,
        );
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["routevariants"] }),
  });
}

// Update route variant:
function useUpdateEntity() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["routevariants"]);
  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (value) => value.stored.id === entity.stored.id,
      );
      if (cachedEntity) {
        entity.stored.creator = cachedEntity.stored.creator;
      }
      const enroute = `/route/route-variant/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["routevariants"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.stored.id === newEntityInf.stored.id
            ? newEntityInf
            : prevEntity,
        ),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["routevariants"] }),
  });
}

// Delete route variant:
function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entityId) => {
      const enroute = `/route/route-variant/`;
      const response = await deleteEntity(entityId, enroute);
      return response;
    },
    onMutate: (entityId) => {
      queryClient.setQueryData(["routevariants"], (prevRoutes) =>
        prevRoutes?.filter((entity) => entity.stored.id !== entityId),
      );
    },
  });
}

export default memo(RouteVariant);
