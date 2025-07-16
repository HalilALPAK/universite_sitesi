import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useTheme } from '@mui/material/styles';
import gorsel from './assets/gorsel.jpg';

const typeColors = {
  'Devlet': 'success',
  'Vakıf': 'info',
};

export default function UniversityCard({ university, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      sx={{
        width: 270,
        height: 340,
        bgcolor: isDark ? 'rgba(40,52,80,0.95)' : 'rgba(245,250,255,0.98)',
        borderRadius: 4,
        boxShadow: isDark ? '0 4px 24px 0 rgba(80,100,200,0.18)' : '0 4px 24px 0 rgba(99,102,241,0.10)',
        border: `2px solid ${isDark ? theme.palette.primary.main : theme.palette.secondary.main}`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: isDark ? '0 8px 32px 0 rgba(99,102,241,0.25)' : '0 8px 32px 0 rgba(99,102,241,0.18)',
          borderColor: theme.palette.primary.main,
        },
      }}
      onClick={onClick}
    >
      {/* Gradient overlay for extra pop */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 140,
        zIndex: 1,
        background: isDark
          ? 'linear-gradient(90deg, rgba(99,102,241,0.10) 0%, rgba(80,100,200,0.10) 100%)'
          : 'linear-gradient(90deg, rgba(99,102,241,0.08) 0%, rgba(100,116,139,0.08) 100%)',
        pointerEvents: 'none',
      }} />
      <CardMedia
        component="img"
        height="140"
        image={gorsel}
        alt={university.name || university.universite_adi}
        sx={{ objectFit: 'cover', zIndex: 0 }}
      />
      <CardContent sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 2,
      }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Chip label={university.type} color={typeColors[university.type] || 'default'} size="small" />
        </Stack>
        <Typography variant="h6">
          {university.universite_adi || '-'}
        </Typography>
        <Typography variant="body2">
          Şehir: {university.sehir || '-'}
        </Typography>
        <Typography variant="body2">
          Tür: {university.tur || '-'}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">Bölüm Sayısı</Typography>
        <Typography variant="h4" fontWeight={700}>{Number.isFinite(Number(university.bolum_sayisi)) ? Number(university.bolum_sayisi) : 0}</Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <StarIcon sx={{ color: '#facc15', fontSize: 22 }} />
          <Typography variant="h6">{Number.isFinite(Number(university.rating)) ? Number(university.rating) : 0}</Typography>
          <Typography variant="body2" color="text.secondary">({Number.isFinite(Number(university.reviewCount)) ? Number(university.reviewCount) : 0})</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: isDark ? 'grey.400' : 'grey.700' }} mt={1}>
          {university.studentCount !== undefined && university.studentCount !== null
            ? university.studentCount.toLocaleString()
            : '-'} öğrenci
        </Typography>
      </CardContent>
    </Card>
  );
} 