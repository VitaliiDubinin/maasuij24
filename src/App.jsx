import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import ApiRequest from './ApiRequest.js';
import Tools from './pages/Tools.jsx';
import Stops from './pages/admin/Stops/Stops.jsx';
import Testmap from './pages/admin/MapBox/TestMap.jsx';
import StopPoints from './pages/admin/StopPoints/StopPoints.jsx';
import Links from './pages/admin/Links/Links.jsx';
import RouteManagement from './pages/admin/RouteManagement/RouteManagement.jsx';
import RouteVariant from './pages/admin/RouteVariant/RouteVariant.jsx';
import LinkPathes from './pages/admin/LinkPathes/LinkPathes.jsx';
import LinkSequences from './pages/admin/LinkSequences/LinkSequences.jsx'
import Leafletwindow from './components/leafmap/Leafletwindow.js';
import ColButGroup from './components/button/ColButGroup.js';
import PersistentDrawerTop from './layouts/PersistentDrawerTop/PersistentDrawerTop.js';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  primary_main_color,
  // drawer_icon_color,
} from './config/themeConfig.js';
import DataTable from './pages/admin/DataTable/DataTable.js';


function App() {
  const client = new QueryClient();
  const theme = createTheme({
    palette: {
      primary: {
        main: primary_main_color,

        //   color: drawer_icon_color,
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif', // Set the font for the entire theme
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            // backgroundColor: '#D3D3D3',
            //border: 'solid red',
            //border: '1px solid ',
            // borderRadius: '10px',
            //padding: '5px 15px',
            //margin: '2px',
          },
          outlined: {
            //borderColor: '#D3D3D3',
            // borderRadius: '10px',
            //padding: '5px',
            padding: '5px 15px',
            //margin: '2px',
          },
        },
      },
    },
  });
  return (
    <QueryClientProvider client={client}>
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="" element={<PersistentDrawerTop />}>
            <Route path="home" element={<ColButGroup colbut="white" />} />
            <Route path="tno" element={<Leafletwindow />} />

            <Route path="mbox" element={<Testmap />} />

            <Route path="schedules" element={<ApiRequest />} />
            <Route path="tools" element={<Tools />} />
            <Route path="stops" element={<Stops />} />
            <Route path="spoints" element={<StopPoints />} />
            <Route path="links" element={<Links />} />
            <Route path="datatable" element={<DataTable />} />
            <Route path="linksequences" element={<LinkSequences />} />
            <Route path="routes" element={<RouteManagement />} />
            <Route path="routevariants" element={<RouteVariant />} />
            <Route path="linkpathes" element={<LinkPathes />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
