// booking.js - handles form submit and schedule render

//form booking
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const booking = {
      id: Date.now(),
      nama: document.getElementById('nama').value.trim(),
      studio: document.getElementById('studio').value,
      tanggal: document.getElementById('tanggal').value,
      jamMulai: document.getElementById('jamMulai').value,
      durasi: parseInt(document.getElementById('durasi').value),
    };

    // hitung total harga
    booking.total = hitungHarga(booking.studio, booking.durasi);

    // simpan ke localStorage
    const data = JSON.parse(localStorage.getItem('bookings') || '[]');
    data.push(booking);
    localStorage.setItem('bookings', JSON.stringify(data));

    // untuk recap bayar
    document.getElementById('modalNama').textContent = booking.nama;
    document.getElementById('modalStudio').textContent = booking.studio;
    document.getElementById('modalTanggal').textContent = booking.tanggal;
    document.getElementById('modalJam').textContent = booking.jamMulai + ' (' + booking.durasi + ' jam)';
    document.getElementById('modalTotal').textContent = formatRupiah(booking.total);

    const modal = new bootstrap.Modal(document.getElementById('qrisModal'));
    modal.show();
  });
}

function hitungHarga(studio, durasi) {
  if (studio === 'Studio 3') {
    if (durasi <= 3) return 600000;
    return 1000000;
  }
  //pricelist studio 1 & 2
  if (durasi === 1) return 100000;
  if (durasi === 2) return 200000;
  return 250000;
}

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

//tabel jadwal pakai scheduleBody
function initSchedule() {
  const tableBody = document.getElementById('scheduleBody');
  if (!tableBody) return;

  const jam = [
    '08:00','09:00','10:00','11:00','12:00','13:00',
    '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'
  ];

  const data = JSON.parse(localStorage.getItem('bookings') || '[]');
  const today = new Date().toISOString().split('T')[0];

  //filter tanggal
  const filterDate = document.getElementById('filterDate');
  const selectedDate = filterDate ? filterDate.value || today : today;

  //booking map ({ "Studio 1": { "09:00": [nama, nama2] } })
  const map = { 'Studio 1': {}, 'Studio 2': {}, 'Studio 3': {} };
  data.forEach(b => {
    if (b.tanggal !== selectedDate) return;
    const studio = b.studio;
    if (!map[studio]) return;
    for (let i = 0; i < b.durasi; i++) {
      const h = parseInt(b.jamMulai.split(':')[0]) + i;
      const key = String(h).padStart(2, '0') + ':00';
      if (!map[studio][key]) map[studio][key] = [];
      map[studio][key].push(b.nama);
    }
  });

  tableBody.innerHTML = '';
  jam.forEach(j => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${j}</td>
      <td>${renderCell(map['Studio 1'][j])}</td>
      <td>${renderCell(map['Studio 2'][j])}</td>
      <td>${renderCell(map['Studio 3'][j])}</td>
    `;
    tableBody.appendChild(row);
  });

  if (filterDate) {
    filterDate.addEventListener('change', initSchedule);
  }
}

function renderCell(names) {
  if (!names || names.length === 0) return '<span style="color:#2a2a2a">—</span>';
  return names.map(n => `<span class="booked-cell">${n}</span>`).join(' ');
}

//ini buat inisialisasi form booking dan schedule saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
  initBookingForm();
  initSchedule();
});
