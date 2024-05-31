import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MainMenu = () => {
  const [expanded, setExpanded] = React.useState(null);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const menuItems = [
    {
      label: 'Objects',
      subItems: ['Stops', 'Points'],
    },
    {
      label: 'Schedules',
      subItems: [],
    },
    {
      label: 'Tools',
      subItems: [],
    },
  ];

  return (
    <List>
      {menuItems.map((menuItem, index) => (
        <Accordion
          key={index}
          expanded={expanded === index}
          onChange={handleChange(index)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{menuItem.label}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {menuItem.subItems.map((subItem, subIndex) => (
                <ListItem key={subIndex} disablePadding>
                  <ListItemText>
                    <Link to={`/${subItem}`} style={{ textDecoration: 'none' }}>
                      {subItem}
                    </Link>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </List>
  );
};

export default MainMenu;
