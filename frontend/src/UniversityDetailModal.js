import React from 'react';
import {
  Dialog, DialogContent, DialogTitle, Box, Typography, Chip, Stack, Tabs, Tab, Button, Divider, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import gorsel from './assets/gorsel.jpg';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ pt: 2 }}>{children}</Box>;
}

// Örnek yorum verisi
const comments = [
  {
    user: 'Ahmet Y.',
    rating: 5,
    date: '2024-05-12',
    text: 'Kampüs ortamı ve akademik kadro harika! Mezun olduktan sonra da destek devam ediyor.'
  },
  {
    user: 'Zeynep K.',
    rating: 4,
    date: '2023-11-03',
    text: 'Sosyal imkanlar çok iyi, ancak bazı fakültelerde ders yoğunluğu fazla.'
  },
  {
    user: 'Mehmet T.',
    rating: 5,
    date: '2022-09-21',
    text: 'Eğitim kalitesi ve kampüs olanakları mükemmel.'
  },
];

// Üniversite için özel marker ikonu (mavi)
const universityIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
  className: 'university-marker'
});
// Yurtlar için kırmızı marker
const dormIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  className: 'dorm-marker'
});

export default function UniversityDetailModal({ open, onClose, university, onRatingChange }) {
  const [tab, setTab] = React.useState(0);
  const [commentList, setCommentList] = React.useState(comments);
  const [newComment, setNewComment] = React.useState({ user: '', rating: 5, text: '' });

  // Ortalama rating ve toplam yorum sayısı
  const avgRating = commentList.length > 0 ? (commentList.reduce((sum, c) => sum + Number(c.rating), 0) / commentList.length).toFixed(1) : 0;
  const reviewCount = commentList.length;

  React.useEffect(() => {
    if (onRatingChange) {
      onRatingChange({ rating: avgRating, reviewCount });
    }
    // eslint-disable-next-line
  }, [avgRating, reviewCount]);

  const handleCommentChange = (e) => {
    setNewComment({ ...newComment, [e.target.name]: e.target.value });
  };
  const handleRatingChange = (e) => {
    setNewComment({ ...newComment, rating: Number(e.target.value) });
  };
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.user || !newComment.text) return;
    setCommentList([
      { ...newComment, date: new Date().toISOString().slice(0, 10) },
      ...commentList,
    ]);
    setNewComment({ user: '', rating: 5, text: '' });
  };
  if (!university) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body" PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
      <Box sx={{ position: 'relative' }}>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', height: 220, overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <img src={gorsel} alt={university.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.5)' }}>
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
            <Box sx={{ position: 'absolute', left: 24, bottom: 24, color: 'white' }}>
              <Typography variant="h5" fontWeight={700}>{university.name}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Chip label={university.type} color={university.type === 'Devlet' ? 'success' : 'info'} size="small" />
                <Typography variant="body2">{university.city}</Typography>
              </Stack>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Genel Bilgiler" />
            <Tab label={`Yorumlar (${university.reviewCount})`} />
            <Tab label="Harita" />
          </Tabs>
          <TabPanel value={tab} index={0}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <Box flex={1} bgcolor="background.default" p={2} borderRadius={2}>
                <Typography variant="subtitle2" color="text.secondary">Kuruluş Yılı</Typography>
                <Typography variant="h6">{university.year}</Typography>
              </Box>
              <Box flex={1} bgcolor="background.default" p={2} borderRadius={2}>
                <Typography variant="subtitle2" color="text.secondary">Öğrenci Sayısı</Typography>
                <Typography variant="h6">{university.studentCount != null ? university.studentCount.toLocaleString() : '-'}</Typography>
              </Box>
              <Box flex={1} bgcolor="background.default" p={2} borderRadius={2}>
                <Typography variant="subtitle2" color="text.secondary">Bölüm Sayısı</Typography>
                <Typography variant="h6">{university.bolum_sayisi || '-'}</Typography>
              </Box>
            </Stack>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Üniversite Hakkında</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{university.description || 'Açıklama bulunamadı.'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Bölümler</Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
              mb: 2,
              justifyItems: 'center',
            }}>
              {university.bolumler && university.bolumler.length > 0 ? university.bolumler.map((bolum, idx) => (
                <Box key={idx} sx={{ width: 240, height: 140, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap title={bolum.bolum_adi}>{bolum.bolum_adi}</Typography>
                  <Typography variant="body2" color="text.secondary">Puan Türü: {bolum.puan_turu}</Typography>
                  <Typography variant="body2" color="text.secondary">2023 Kontenjan: {bolum.kontenjanlar && bolum.kontenjanlar["2023"]}</Typography>
                  <Typography variant="body2" color="text.secondary">2023 Taban Puan: {bolum.taban_puan && bolum.taban_puan["2023"]}</Typography>
                </Box>
              )) : <Typography>Bölüm bilgisi yok.</Typography>}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Değerlendirme</Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <StarIcon sx={{ color: '#facc15', fontSize: 24 }} />
              <Typography variant="h6">{avgRating}</Typography>
              <Typography variant="body2" color="text.secondary">({reviewCount} değerlendirme)</Typography>
            </Box>
            <Button size="small" color="primary">Tüm yorumları gör</Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>İletişim Bilgileri</Typography>
            <Typography variant="body2" color="text.secondary" mb={0.5}>{university.address || '-'}</Typography>
            <Typography variant="body2" color="text.secondary" mb={0.5}>{university.phone || '-'}</Typography>
            <Typography variant="body2" color="primary" mb={0.5}>{university.website || '-'}</Typography>
            <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={onClose} variant="outlined">Kapat</Button>
              <Button href={university.website} target="_blank" variant="contained" color="primary">Web Sitesini Ziyaret Et</Button>
            </Box>
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {/* Yorumlar sekmesi */}
            <Box mb={2}>
              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f6fa', padding: 16, borderRadius: 8 }}>
                <Typography variant="subtitle2" mb={1}>Yorum Ekle</Typography>
                <input
                  name="user"
                  placeholder="Adınız"
                  value={newComment.user}
                  onChange={handleCommentChange}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                  required
                />
                <select name="rating" value={newComment.rating} onChange={handleRatingChange} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Yıldız</option>)}
                </select>
                <textarea
                  name="text"
                  placeholder="Yorumunuz"
                  value={newComment.text}
                  onChange={handleCommentChange}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                  rows={3}
                  required
                />
                <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 4, padding: '8px 0', fontWeight: 600, cursor: 'pointer' }}>Yorumu Ekle</button>
              </form>
            </Box>
            {commentList.map((c, i) => (
              <Box key={i} mb={2} p={2} bgcolor="background.default" borderRadius={2}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <Typography fontWeight={600}>{c.user}</Typography>
                  <StarIcon sx={{ color: '#facc15', fontSize: 18 }} />
                  <Typography>{c.rating}</Typography>
                  <Typography color="text.secondary" fontSize={13} ml={1}>{c.date}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">{c.text}</Typography>
              </Box>
            ))}
            {commentList.length === 0 && (
              <Typography variant="body2" color="text.secondary">Henüz yorum yok.</Typography>
            )}
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Harita</Typography>
            {university.konum ? (
              <Box sx={{ width: '100%', height: 420, my: 2, borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
                <MapContainer
                  center={[university.konum.lat, university.konum.lng]}
                  zoom={13}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />
                  <Marker position={[university.konum.lat, university.konum.lng]} icon={universityIcon}>
                    <Popup>
                      {university.universite_adi}
                    </Popup>
                  </Marker>
                  {university.yurtlar && university.yurtlar.map((yurt, i) => (
                    <Marker key={i} position={[yurt.lat, yurt.lng]} icon={dormIcon}>
                      <Popup>
                        {yurt.ad}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">Konum verisi bulunamadı.</Typography>
            )}
          </TabPanel>
        </DialogContent>
      </Box>
    </Dialog>
  );
} 