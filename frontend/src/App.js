import React from 'react';
import UniversityCard from './UniversityCard';
import UniversityDetailModal from './UniversityDetailModal';
// import universitiesData from './universities.json'; // Bunu kaldır
import { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

function App() {
  const [universities, setUniversities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedUniversity, setSelectedUniversity] = React.useState(null);
  const [universityRatings, setUniversityRatings] = useState({});
  const perPage = 12;
  const [darkMode, setDarkMode] = useState(true);
  const [typeFilter, setTypeFilter] = useState('hepsi');
  const [bolumFilter, setBolumFilter] = useState('');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:3000/universiteler').then(res => res.json()),
      fetch('http://localhost:3001/yerler').then(res => res.json())
    ]).then(([unis, yerler]) => {
      const merged = unis.map(u => {
        const yurtData = yerler.find(y =>
          normalizeName(y.universite_adi) === normalizeName(u.universite_adi)
        );
        return {
          ...u,
          konum: yurtData ? yurtData.konum : null,
          yurtlar: yurtData ? yurtData.yurtlar : []
        };
      });
      setUniversities(merged);
      setLoading(false);
    });
  }, []);

  // Arama ve filtre uygula
  const filtered = universities.filter(u => {
    const nameMatch = (u.universite_adi && u.universite_adi.toLowerCase().includes(search.toLowerCase())) ||
      (u.sehir && u.sehir.toLowerCase().includes(search.toLowerCase()));
    const typeMatch = typeFilter === 'hepsi' || (typeFilter === 'devlet' && u.tur.toLowerCase() === 'devlet') || (typeFilter === 'vakıf' && u.tur.toLowerCase() === 'vakıf');
    const bolumMatch = !bolumFilter || (u.bolumler && u.bolumler.some(b => b.bolum_adi && b.bolum_adi.toLowerCase().includes(bolumFilter.toLowerCase())));
    return nameMatch && typeMatch && bolumMatch;
  });
  const pageCount = Math.ceil(filtered.length / perPage);
  const pagedUniversities = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCardClick = (uni) => {
    setSelectedUniversity(uni);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUniversity(null);
  };
  // Yorum eklenince rating güncelle
  const handleRatingChange = ({ rating, reviewCount }) => {
    if (selectedUniversity) {
      setUniversityRatings(prev => ({
        ...prev,
        [selectedUniversity.universite_adi]: { rating, reviewCount }
      }));
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#6366f1' },
      secondary: { main: '#64748b' },
      background: {
        default: darkMode ? '#181f2a' : '#f5f6fa',
        paper: darkMode ? '#232b39' : '#fff',
      },
    },
    typography: { fontFamily: 'Inter, Arial, sans-serif' },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', background: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ width: '100%', bgcolor: darkMode ? '#232b39' : '#6366f1', color: darkMode ? '#fff' : '#fff', py: 2, px: 4, boxShadow: 2, mb: 2, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 16, right: 32, display: 'flex', alignItems: 'center', zIndex: 2 }}>
            <LightModeIcon sx={{ color: darkMode ? 'grey.500' : 'primary.main', mr: 1 }} />
            <Switch checked={darkMode} onChange={() => setDarkMode(v => !v)} color="primary" />
            <DarkModeIcon sx={{ color: darkMode ? 'primary.main' : 'grey.500', ml: 1 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} letterSpacing={1} sx={{ mb: 0.5 }}>
            Üniversite Rehberi
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
            Türkiye'deki üniversiteleri ve bölümleri kolayca keşfet
          </Typography>
        </Box>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ position: 'relative', width: 360 }}>
            <SearchIcon style={{ position: 'absolute', left: 12, top: 16, color: darkMode ? '#a5b4fc' : '#6366f1', zIndex: 1 }} />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Üniversite veya şehir ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{
                bgcolor: darkMode ? '#232b39' : '#fff',
                borderRadius: 2,
                boxShadow: darkMode ? '0 2px 8px 0 #232b3933' : '0 2px 8px 0 #6366f133',
                input: {
                  pl: 4,
                  color: darkMode ? '#fff' : '#232b39',
                  fontWeight: 500,
                  fontSize: 16,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkMode ? '#6366f1' : '#64748b',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                    borderWidth: 2,
                  },
                },
              }}
              InputProps={{
                startAdornment: <span style={{ width: 32 }} />,
              }}
            />
          </div>
        </div>
        {/* Filtreleme alanı */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="type-filter-label">Tür</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Tür"
              onChange={e => setTypeFilter(e.target.value)}
            >
              <MenuItem value="hepsi">Hepsi</MenuItem>
              <MenuItem value="devlet">Devlet</MenuItem>
              <MenuItem value="vakıf">Vakıf</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Bölüm adı ile filtrele..."
            value={bolumFilter}
            onChange={e => setBolumFilter(e.target.value)}
            sx={{ bgcolor: darkMode ? '#232b39' : '#fff', borderRadius: 2, minWidth: 220 }}
          />
        </Box>
        <div style={{ flex: 1 }}>
          {/* Pagination bar üstte */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size="large"
              showFirstButton
              showLastButton
            />
          </div>
          {loading ? (
            <div>Yükleniyor...</div>
          ) : (
            <div>
              {/* Kartlar için grid container ekle */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 24,
                justifyContent: 'center',
                alignItems: 'stretch',
                margin: '0 auto',
                maxWidth: 1400
              }}>
                {pagedUniversities.map((uni, idx) => (
                  <div key={idx}>
                    <UniversityCard
                      university={{
                        ...uni,
                        rating: universityRatings[uni.universite_adi]?.rating || uni.rating,
                        reviewCount: universityRatings[uni.universite_adi]?.reviewCount || uni.reviewCount,
                      }}
                      onClick={() => handleCardClick(uni)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <UniversityDetailModal
            open={modalOpen}
            university={selectedUniversity}
            onClose={handleModalClose}
            onRatingChange={handleRatingChange}
          />
        </div>
        {/* Footer */}
        <Box sx={{ width: '100%', bgcolor: darkMode ? '#181f2a' : '#f5f6fa', color: darkMode ? '#a5b4fc' : '#64748b', py: 2, px: 4, mt: 4, textAlign: 'center', fontSize: 15 }}>
          © {new Date().getFullYear()} Üniversite Rehberi | Hazırlayan: Halil ALPAK
        </Box>
      </div>
    </ThemeProvider>
  );
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default App;
