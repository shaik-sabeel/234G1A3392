import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Slider,
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';

import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneIcon from '@mui/icons-material/Done';
import TuneIcon from '@mui/icons-material/Tune';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';

const API_BASE = 'http://localhost:5000/api';

function Layout({ children, profile }) {
  const location = useLocation();
  const currentTab = location.pathname === '/all' ? 1 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <NotificationsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Notify Hub
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Student Notification Portal
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {profile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'primary.light', fontMono: true }}>
                    {profile.rollNo}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs value={currentTab} indicatorColor="primary" textColor="primary">
            <Tab 
              label="Priority Inbox" 
              icon={<DashboardIcon sx={{ fontSize: 18 }} />} 
              iconPosition="start"
              component={Link} 
              to="/" 
            />
            <Tab 
              label="All Notifications" 
              icon={<ListAltIcon sx={{ fontSize: 18 }} />} 
              iconPosition="start"
              component={Link} 
              to="/all" 
            />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Grid item="true" xs={12} sm={6}>
              {/* <Typography variant="body2" color="text.secondary" align="left">
                © 2026 Sumathi Reddy Institute of Technology. All rights reserved.
              </Typography> */}
            </Grid>
            <Grid item="true" xs={12} sm={6} sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              {/* <Typography variant="caption" color="text.secondary">
                SRIT Portal (MUI Stack)
              </Typography> */}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

function PriorityInboxView({ profile, viewedIds, onMarkViewed }) {
  const [notifications, setNotifications] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPriority = useCallback(async (currentLimit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/notifications`, {
        params: { n: currentLimit }
      });
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriority(limit);
  }, [limit, fetchPriority]);

  return (
    <Grid container spacing={4}>
      <Grid item="true" xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', mb: 2, display: 'block' }}>
                Profile Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>{profile.name[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{profile.name}</Typography>
                  <Typography variant="body2" color="primary.light" sx={{ fontFamily: 'monospace' }}>{profile.rollNo}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {profile.email}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                  <TuneIcon fontSize="small" color="primary" /> Feed Settings
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<RefreshIcon />} 
                  onClick={() => fetchPriority(limit)}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
              
              <Box sx={{ px: 1, mt: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                  DISPLAY CAPACITY (n = {limit})
                </Typography>
                <Slider
                  min={3}
                  max={30}
                  value={limit}
                  onChange={(e, val) => setLimit(val)}
                  valueLabelDisplay="auto"
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>

      <Grid item="true" xs={12} md={8}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            Priority Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Showing top {notifications.length} updates
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
            <Typography variant="body1" color="text.secondary">
              No notifications in your priority inbox.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((notif) => {
              const isViewed = viewedIds.includes(notif.ID);
              return (
                <NotificationCard 
                  key={notif.ID} 
                  notif={notif} 
                  isViewed={isViewed} 
                  onMarkViewed={onMarkViewed} 
                />
              );
            })}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

function AllNotificationsView({ viewedIds, onMarkViewed }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState(''); 
  const limit = 6; 

  const fetchAll = useCallback(async (pageNum, catType) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum,
        limit
      };
      if (catType) {
        params.notification_type = catType;
      }
      
      const response = await axios.get(`${API_BASE}/notifications/all`, { params });
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
        const totalItems = response.data.total || 0;
        setTotalPages(Math.ceil(totalItems / limit) || 1);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(page, category);
  }, [page, category, fetchAll]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setPage(1); 
  };

  const handlePageChange = (e, val) => {
    setPage(val);
  };

  return (
    <Grid container spacing={4}>
      <Grid item="true" xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <TuneIcon fontSize="small" color="primary" /> Filter Categories
              </Typography>
              <IconButton size="small" onClick={() => fetchAll(page, category)} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>

            <List component="nav" aria-label="notification categories">
              <ListItem 
                button 
                selected={category === ''} 
                onClick={() => handleCategoryChange('')}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemText primary="Show All Updates" />
              </ListItem>
              <ListItem 
                button 
                selected={category === 'Placement'} 
                onClick={() => handleCategoryChange('Placement')}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><WorkIcon fontSize="small" color="primary" /></ListItemIcon>
                <ListItemText primary="Placements" />
              </ListItem>
              <ListItem 
                button 
                selected={category === 'Result'} 
                onClick={() => handleCategoryChange('Result')}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><SchoolIcon fontSize="small" color="secondary" /></ListItemIcon>
                <ListItemText primary="Results" />
              </ListItem>
              <ListItem 
                button 
                selected={category === 'Event'} 
                onClick={() => handleCategoryChange('Event')}
                sx={{ borderRadius: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><EventIcon fontSize="small" sx={{ color: '#fbbf24' }} /></ListItemIcon>
                <ListItemText primary="Events" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item="true" xs={12} md={8}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            All Updates
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
            <Typography variant="body1" color="text.secondary">
              No updates match the selected category.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((notif) => {
              const isViewed = viewedIds.includes(notif.ID);
              return (
                <NotificationCard 
                  key={notif.ID} 
                  notif={notif} 
                  isViewed={isViewed} 
                  onMarkViewed={onMarkViewed} 
                />
              );
            })}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

function NotificationCard({ notif, isViewed, onMarkViewed }) {
  const getBadgeDetails = (type) => {
    switch (type?.toLowerCase()) {
      case 'placement':
        return {
          label: 'Placement',
          color: 'primary',
          icon: <WorkIcon fontSize="inherit" />
        };
      case 'result':
        return {
          label: 'Result',
          color: 'secondary',
          icon: <SchoolIcon fontSize="inherit" />
        };
      case 'event':
        return {
          label: 'Event',
          sx: { bgcolor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' },
          icon: <EventIcon fontSize="inherit" />
        };
      default:
        return {
          label: type || 'Info',
          color: 'default',
          icon: <InfoIcon fontSize="inherit" />
        };
    }
  };

  const badge = getBadgeDetails(notif.Type);

  return (
    <Card sx={{ 
      transition: 'opacity 0.2s, transform 0.2s',
      opacity: isViewed ? 0.65 : 1, 
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: 'rgba(255, 255, 255, 0.12)'
      }
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
          <Avatar sx={{ 
            bgcolor: 'background.default', 
            border: '1px solid', 
            borderColor: 'divider',
            width: 40,
            height: 40,
            color: badge.color ? `${badge.color}.light` : badge.sx?.color
          }}>
            {badge.icon}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
              <Chip 
                label={badge.label} 
                size="small" 
                color={badge.color} 
                sx={badge.sx}
                variant="outlined" 
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="inherit" sx={{ fontSize: 12 }} /> {notif.Timestamp}
              </Typography>

              {!isViewed && (
                <Chip
                  icon={<FiberNewIcon />}
                  label="New"
                  size="small"
                  color="info"
                  variant="filled"
                  sx={{ height: 20, '& .MuiChip-icon': { fontSize: 14, ml: 0.5 } }}
                />
              )}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5, color: 'text.primary' }}>
              {notif.Message || 'No updates info provided.'}
            </Typography>

            <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: 'text.secondary', fontFamily: 'monospace' }}>
              ID: {notif.ID}
            </Typography>
          </Box>

          {!isViewed && (
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => onMarkViewed(notif.ID)}
              title="Mark as viewed"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.8 }}
            >
              <DoneIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function App() {
  const [profile, setProfile] = useState({
    name: 'Student',
    rollNo: '234G1A3392',
    email: '234g1a3392@srit.ac.in'
  });

  const [viewedIds, setViewedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('srit_viewed_updates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('srit_viewed_updates', JSON.stringify(viewedIds));
  }, [viewedIds]);

  useEffect(() => {
    axios.get(`${API_BASE}/profile`)
      .then(res => setProfile(res.data))
      .catch(err => console.log('Could not fetch student details', err));
  }, []);

  const handleMarkViewed = (id) => {
    setViewedIds(prev => [...prev, id]);
  };

  return (
    <BrowserRouter>
      <Layout profile={profile}>
        <Routes>
          <Route 
            path="/" 
            element={
              <PriorityInboxView 
                profile={profile} 
                viewedIds={viewedIds} 
                onMarkViewed={handleMarkViewed} 
              />
            } 
          />
          <Route 
            path="/all" 
            element={
              <AllNotificationsView 
                viewedIds={viewedIds} 
                onMarkViewed={handleMarkViewed} 
              />
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
