import * as React from 'react';
import { Link, Outlet } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ConstructionIcon from '@mui/icons-material/Construction';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import BusinessIcon from '@mui/icons-material/Business';
import ListItemText from '@mui/material/ListItemText';
import { styled, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

// import UpToTopButton from '../../components/button/UpToTopButton';
// import AccountMenu from '../../components/menu/AccountMenu';

const drawerWidth = 240;

const essentailNav = {
  Home: [<HomeIcon />, 'welcome'],
  'Transport Network Objects ': [<AddLocationAltIcon />, 'tno'],
  Schedules: [<ScheduleSendIcon />, 'schedules'],
  Tools: [<ConstructionIcon />, 'tools'],
};

const navigationNames = {
  null: { ...essentailNav },
  3: { ...essentailNav },
  1: {
    ...essentailNav,

    Users: [<GroupIcon />, 'admin/users'],
    Companies: [<BusinessIcon />, 'admin/companies'],
  },
  2: {
    ...essentailNav,
    Users: [<GroupIcon />, 'admin/users'],
  },
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const mapListItem = (text, icon, link) => {
  return (
    <Link to={`/${link}`} key={text} style={{ textDecoration: 'none' }}>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={text} />
        </ListItemButton>
      </ListItem>
    </Link>
  );
};

const handleNavbar = () => {
  const role = sessionStorage.getItem('role');
  // const {role} = useAuth();
  return Object.entries(navigationNames[role]).map(([text, value]) => {
    const icon = value[0];
    const route = value[1];
    return <div key={text}>{mapListItem(text, icon, route)}</div>;
  });
};

export default function PersistentDrawerTop() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1024); // Adjust the breakpoint as needed
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* <AppBar position="fixed" open={open} sx={{ background: 'green' }}> */}
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            // color="white"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && {
                // display: 'none'
                visibility: 'hidden',
              }),
            }}
            // style={{ color: 'red' }}
          >
            <MenuIcon />
          </IconButton>
          {/* <AccountMenu /> */}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader
          sx={{
            // backgroundColor: 'red',
            // backgroundColor: '#1976d2',
            backgroundColor: '#00966E',
            color: 'white',
          }}
          // style={{ color: 'red' }}
        >
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              color: 'white',
            }}
          >
            {theme.direction === 'ltr' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ '& .MuiListItemText-primary': { color: 'red' } }}>
          {handleNavbar()}
        </List>
        {/* <List sx={{ '& .MuiListItemText-primary': { color: 'red' } }}> */}

        {/* <List>
          {handleNavbar().map((item, index) => (
            <ListItem
              key={index}
              disablePadding
              sx={{
                // '&:hover': {
                //   backgroundColor: '#00966E',
                color: 'red',
                // },
              }}
            >
              {item}
            </ListItem>
          ))}

        </List> */}

        {/* <List>
          {handleNavbar().map((item, index) => (
            <ListItem
              key={index}
              disablePadding
              //   sx={{ '& .MuiListItemText-primary': { color: 'red' } }}
            >
              <ListItemButton>
                <ListItemIcon>{item}</ListItemIcon>
                <ListItemText
                  primary={item.props.primary}
                  //   style={{ color: 'red' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
        {/* <UpToTopButton /> */}
      </Main>
    </Box>
  );
}
