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
  return {
    name: !validateRequired(entity.name) ? "Stop point name is required" : "",
    number: !validateRequired(entity.number)
      ? "Number is required"
      : "",
    active: !validateRequired(entity.active) ? "Active is required" : "",
  };
}

const StopPoints = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const transformTableToJson = (values) => {
    console.log("Values", values);
    console.log("Values.creator", values.creator);
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
      point: {
        x: values.x || null,
        y: values.y || null,
      },
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
        accessorFn: (row) => row.persistent?.description,
        id: "description",
        header: "Description",
        muiEditTextFieldProps: {
          required: false,
          error: !!validationErrors?.persistent?.description,
          helperText: validationErrors?.persistent?.description,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              persistent: { ...prevErrors.persistent, description: undefined },
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
        accessorFn: (row) => row.point?.x,
        id: "x",
        header: "X Coordinate",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.point?.x,
          helperText: validationErrors?.point?.x,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              point: { ...prevErrors.point, x: undefined },
            })),
        },
      },
      {
        accessorFn: (row) => row.point?.y,
        id: "y",
        header: "Y Coordinate",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.point?.y,
          helperText: validationErrors?.point?.y,
          onFocus: () =>
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              point: { ...prevErrors.point, y: undefined },
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
    console.log(values);
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

  //UPDATE action:
  const handleSaveEntity = async ({ values, table }) => {
    const newValidationErrors = validateEntity(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    const transformedValues = transformTableToJson(values);
    console.log(transformedValues);
    await updateEntity(transformedValues);
    table.setEditingRow(null);
  };

  //DELETE action:
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this Stop Point?")) {
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
        <DialogTitle variant="h5">Create New Stop Point</DialogTitle>
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
        <DialogTitle variant="h5">Edit Stop Point</DialogTitle>
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
        Create New Stop Point
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
    mutationFn: async (spoint) => {
      const enroute = `/stop-point/create`;
      spoint.persistent.creator = 132;
      const response = await createEntityForm(spoint, enroute);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["spoints"], (prevEntities) => {
        return prevEntities.map((entity) =>
          entity.persistent?.id === variables.persistent?.id
            ? { ...entity, "persistent.id": data.persistent.id }
            : entity,
        );
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["spoints"] }),
  });
}

//READ hook (get Entities from api)
function useGetEntity() {
  return useQuery({
    queryKey: ["spoints"],
    queryFn: async () => {
      const response = await getData(`stop-point/find-all`);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Entity in api)
function useUpdateEntity() {
  const queryClient = useQueryClient();
  const cachedPointsData = queryClient.getQueryData(["spoints"]);
  return useMutation({
    mutationFn: async (entity) => {
      const cachedEntity = cachedPointsData?.find(
        (point) => point.persistent.id === entity.persistent.id,
      );
      if (cachedEntity) {
        entity.persistent.creator = cachedEntity.persistent.creator;
      }
      const enroute = `/stop-point/edit`;
      const response = await updateEntityForm(entity, enroute);
      return response;
    },
    onMutate: (newEntityInf) => {
      queryClient.setQueryData(["spoints"], (prevEntities) =>
        prevEntities?.map((prevEntity) =>
          prevEntity.id === newEntityInf.persistent.id
            ? newEntityInf
            : prevEntity,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["spoints"] }),
  });
}

//DELETE hook (delete Entity in api)
function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entityId) => {
      const enroute = `/stop-point/`;
      const response = await deleteEntity(entityId, enroute);
      return response;
    },
    onMutate: (entityId) => {
      queryClient.setQueryData(["spoints"], (prevEntities) =>
        prevEntities?.filter((entity) => entity.persistent.id !== entityId),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["spoints"] }),
  });
}

export default memo(StopPoints);
