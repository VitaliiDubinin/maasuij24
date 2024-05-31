import React, { memo, useMemo, useState } from "react";
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
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  getData,
  createEntityForm,
  updateEntityForm,
  deleteEntity,
} from "../../../lib/fetch";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";

const validateRequired = (value) =>
  value !== undefined && value !== null && value !== "";

function validateEntity(entity) {
  return {
    routeDisplayedNumber: !validateRequired(entity.routeDisplayedNumber)
      ? "Displayed Number is required"
      : "",

    name: !validateRequired(entity.name) ? "Route name is required" : "",
    description: !validateRequired(entity.description)
      ? "Description is required"
      : "",
    active: !validateRequired(entity.active) ? "Active is required" : "",
    startStopId: !validateRequired(entity.startStopId)
      ? "Start Stop is required"
      : "",
    finishStopId: !validateRequired(entity.finishStopId)
      ? "Finish Stop is required"
      : "",
  };
}

const RouteManagement = () => {
  const [validationErrors, setValidationErrors] = useState({});

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
      routeDisplayedNumber: values.routeDisplayedNumber || null,
      startStopId: values.startStopId || null,
      finishStopId: values.finishStopId || null,
      routeVariantIds: values.routeVariantIds || [],
    };
  };

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
        accessorFn: (row) => row.routeDisplayedNumber,
        id: "routeDisplayedNumber",
        header: "Route number",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.routeDisplayedNumber,
          helperText: validationErrors?.routeDisplayedNumber,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              routeDisplayedNumber: undefined,
            }),
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
        accessorFn: (row) => row.startStopId,
        id: "startStopId",
        header: "Start Stop",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.startStopId,
          helperText: validationErrors?.startStopId,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              startStopId: undefined,
            }),
        },
      },
      {
        accessorFn: (row) => row.finishStopId,
        id: "finishStopId",
        header: "Finish Stop",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.finishStopId,
          helperText: validationErrors?.finishStopId,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              finishStopId: undefined,
            }),
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
        accessorFn: (row) => row.persistent?.creator,
        id: "creator",
        header: "Creator",
        enableEditing: false,
        size: 80,
      },
    ],
    [validationErrors],
  );

  const {
    data: fetchedRoutes = [],
    isError: isLoadingRoutesError,
    isFetching: isFetchingRoutes,
    isLoading: isLoadingRoutes,
  } = useGetRoutes();

  const { mutateAsync: createRoute, isPending: isCreatingRoute } =
    useCreateRoute();
  const { mutateAsync: updateRoute, isPending: isUpdatingRoute } =
    useUpdateRoute();
  const { mutateAsync: deleteEntity, isPending: isDeletingRoute } =
    useDeleteRoute();

  const handleCreateRoute = async ({ values, table }) => {
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);

    await createRoute(transformedValues);
    table.setCreatingRow(null);
  };

  const handleSaveRoute = async ({ values, table }) => {
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    await updateRoute(transformedValues);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      deleteEntity(row.original.persistent.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedRoutes,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingRoutesError
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
    onCreatingRowSave: handleCreateRoute,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveRoute,

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Create New Route</DialogTitle>
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
        <DialogTitle variant="h5">Edit Route</DialogTitle>
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
        Create New Route
      </Button>
    ),

    state: {
      isLoading: isLoadingRoutes,
      isSaving: isCreatingRoute || isUpdatingRoute || isDeletingRoute,
      showAlertBanner: isLoadingRoutesError,
      showProgressBars: isFetchingRoutes,
    },
  });

  return <MaterialReactTable table={table} />;
};

// Get all routes:
function useGetRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await getData("route/find-all");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

// Create new route:
function useCreateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newroute) => {
      const enroute = `/route/create`;
      newroute.persistent.creator = 132;
      const response = await createEntityForm(newroute, enroute);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["routes"], (prevEntities) => {
        return prevEntities.map((entity) =>
          entity.persistent?.id === variables.persistent?.id
            ? { ...entity, "persistent.id": data.persistent.id }
            : entity,
        );
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

// Update route:
function useUpdateRoute() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["routes"]);
  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (value) => value.persistent.id === entity.persistent.id,
      );
      if (cachedEntity) {
        entity.persistent.creator = cachedEntity.persistent.creator;
      }
      const enroute = `/route/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["routes"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.persistent.id === newEntityInf.persistent.id
            ? newEntityInf
            : prevEntity,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

// Delete route:
function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (routeId) => {
      const enroute = `/route/`;

      const response = await deleteEntity(routeId, enroute);
      return response;
    },
    onMutate: (routeId) => {
      queryClient.setQueryData(["routes"], (prevRoutes) =>
        prevRoutes?.filter((route) => route.persistent.id !== routeId),
      );
    },
  });
}

export default memo(RouteManagement);
