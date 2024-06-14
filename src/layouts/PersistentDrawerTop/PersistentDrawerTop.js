import * as React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
import ColButGroup from '../../components/button/ColButGroup';
import {
  primary_main_color,
  drawer_icon_color,
  left_menu_text_color,
} from '../../config/themeConfig';

// import UpToTopButton from '../../components/button/UpToTopButton';
// import AccountMenu from '../../components/menu/AccountMenu';

const drawerWidth = 240;

const essentailNav = {
  Home: [<HomeIcon />, 'home'],
  'Transport Network Objects ': [<AddLocationAltIcon />, 'tno'],

  MapBox: ['', 'mbox'],
  Links: ['', 'links'],
  'Link Pathes': ['', 'linkpathes'],
  'Link Sequences': ['', 'linksequences'],
  Stops: ['', 'stops'],
  'Stop Points': ['', 'spoints'],
  Routes: ['', 'routes'],
  'Route Variants': ['', 'routevariants'],
  DataTable: ['', 'datatable'],

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
  //const role = sessionStorage.getItem('role');
  // const {role} = useAuth();
  //  const role = 3;
  const role = 1;
  return Object.entries(navigationNames[role]).map(([text, value]) => {
    const icon = value[0];
    const route = value[1];
    return <div key={text}>{mapListItem(text, icon, route)}</div>;
  });
};

export default function PersistentDrawerTop() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  //const navigate = useNavigate();
  const location = useLocation();
  const shouldShowColButGroup =
    location.pathname === '/tno' || location.pathname === '/schedules';

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
          {/* {' '}
          <ColButGroup /> */}
          <div style={{ display: 'flex', alignItems: 'left' }}>
            <IconButton
              //       color="inherit"
              // color="white"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                mr: 2,
                color: drawer_icon_color,
                ...(open && {
                  // display: 'none'
                  visibility: 'hidden',
                }),
              }}
              //style={{ color: 'red' }}
            >
              <MenuIcon />
            </IconButton>
            {shouldShowColButGroup && <ColButGroup colbut="white" />}
          </div>
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
            backgroundColor: primary_main_color,
            //   color: drawer_icon_color,
          }}
        >
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              color: drawer_icon_color,
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
        <List
          sx={{ '& .MuiListItemText-primary': { color: left_menu_text_color } }}
        >
          {handleNavbar()}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
        {/* <UpToTopButton /> */}
      </Main>
    </Box>
  );
}
