import React, { useState } from 'react';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';

export default function ColButGroup({ colbut }) {
  const [leftGroupOpen, setLeftGroupOpen] = useState(false);
  const [rightGroupOpen, setRightGroupOpen] = useState(false);
  const [centerGroupOpen, setCenterGroupOpen] = useState(false);
  const theme = useTheme();

  const buttonGroupStyle = {
    fontFamily: theme.typography.fontFamily,
  };

  const groupButtonStyle = {
    fontSize: '0.7rem',
    width: '5rem',
    backgroundColor: colbut,
    height: '3rem',
    color: '#00966E',

    '&:hover': {
      backgroundColor: '#00966E',
      color: 'white',
      borderColor: '#15e577',
    },
  };
  const buttonStyle = {
    width: '4rem',
    height: '3rem',
    borderRadius: '2px',
    margin: '2px',
    //borderColor: 'white',
    borderColor: '#15e577',
    //backgroundColor: '#D3D3D3',
    backgroundColor: colbut,
    //color: 'red',
    '& .css-1vtq1t2-MuiButtonGroup-root .MuiButtonGroup-firstButton,': {
      borderRadius: '2px !important',
      border: '1px solid !important',
      borderColor: theme.palette.primary.light + ' !important',
    },
    fontSize: '0.7rem',
    '&:hover': {
      backgroundColor: '#D3D3D3',
      //backgroundColor: colbut,
    },
  };

  const toggleLeftGroup = () => {
    setLeftGroupOpen((prevState) => !prevState);
    setRightGroupOpen(false);
    setCenterGroupOpen(false);
  };

  const toggleRightGroup = () => {
    setRightGroupOpen((prevState) => !prevState);
    setLeftGroupOpen(false);
    setCenterGroupOpen(false);
  };

  const toggleCenterGroup = () => {
    setCenterGroupOpen((prevState) => !prevState);
    setLeftGroupOpen(false);
    setRightGroupOpen(false);
  };

  return (
    <div>
      <Button
        sx={groupButtonStyle}
        onClick={toggleLeftGroup}
        variant={leftGroupOpen ? 'contained' : 'outlined'}
        endIcon={leftGroupOpen && <ExpandMoreIcon />}
      >
        {/* Stopping Points
        {leftGroupOpen ? <ExpandMoreIcon /> : null} */}
        {/* Stopping Points {leftGroupOpen && <ExpandMoreIcon />} */}
        {!leftGroupOpen && 'Stopping Points'}
      </Button>
      {leftGroupOpen && (
        <ButtonGroup sx={buttonGroupStyle}>
          <Button sx={buttonStyle}>Stops</Button>
          <Button sx={buttonStyle}>Stops</Button>
          <Button sx={buttonStyle}>Links</Button>

          <Button sx={buttonStyle}>Link's path</Button>
          <Button sx={buttonStyle}>Link Sequ's</Button>
          <Button sx={buttonStyle}>Routes</Button>
          <Button sx={buttonStyle}>Route's variants</Button>
        </ButtonGroup>
      )}
      <Button
        sx={groupButtonStyle}
        onClick={toggleCenterGroup}
        variant={centerGroupOpen ? 'contained' : 'outlined'}
        endIcon={centerGroupOpen && <ExpandMoreIcon />}
      >
        {/* Schedules {centerGroupOpen ? <ExpandMoreIcon /> : null} */}
        {!centerGroupOpen && 'Schedules'}
      </Button>
      {centerGroupOpen && (
        <ButtonGroup sx={buttonGroupStyle}>
          <Button sx={buttonStyle}>Runs</Button>

          <Button sx={buttonStyle}>Trips</Button>
          <Button sx={buttonStyle}>Blocks</Button>
          <Button sx={buttonStyle}>Day Types</Button>
        </ButtonGroup>
      )}
      <Button
        sx={groupButtonStyle}
        onClick={toggleRightGroup}
        variant={rightGroupOpen ? 'contained' : 'outlined'}
        endIcon={rightGroupOpen && <ExpandMoreIcon />}
      >
        {/* Tools {rightGroupOpen ? <ExpandMoreIcon /> : null} */}
        {!rightGroupOpen && 'Tools'}
      </Button>
      {rightGroupOpen && (
        <ButtonGroup sx={buttonGroupStyle}>
          <Button sx={buttonStyle}>Tool..A</Button>
          <Button sx={buttonStyle}>Tool..B</Button>
          <Button sx={buttonStyle}>Tool..C</Button>
        </ButtonGroup>
      )}
    </div>
  );
}
