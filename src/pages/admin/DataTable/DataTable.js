import React, { useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box } from '@mui/material';

const DataTable = () => {

  const data = useMemo(() => [
    { startPoint: 'Stop Point 1', endPoint: 'Stop Point 2', link: 'Link 1' },
    { startPoint: 'Stop Point 3', endPoint: 'Stop Point 4', link: 'Link 2' },
    { startPoint: 'Stop Point 2', endPoint: 'Stop Point 3', link: 'Link 3' },
    { startPoint: 'Stop Point 5', endPoint: 'Stop Point 6', link: 'Link 4' },
  ], []);

  const columns = useMemo(() => [
    {
      accessorKey: 'link',
      header: 'Link'
    },
    {
      accessorKey: 'startPoint',
      header: 'Start Point'
    },
    {
      accessorKey: 'endPoint',
      header: 'End Point'
    }
  ], []);

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableGrouping
      initialState={{
        expanded: false, 
        grouping: ['link'],
        isFullScreen: true,
        pagination: {
          pageIndex: 0,
          pageSize: 20
        }
      }}
    />
  );
};

export default DataTable;
