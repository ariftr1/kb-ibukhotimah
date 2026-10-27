/**
 * Aplikasi Silsilah Keluarga Besar Ibu Khotimah
 * Modul Kontrol Navigasi & Tambah Anggota Baru
 */

function updateAddMemberGenInfo() {
  const parentSelect = document.getElementById('form-add-member-parent');
  const genBadge = document.getElementById('form-add-member-gen-badge');
  if (!genBadge) return;

  if (!parentSelect || !parentSelect.value) {
    genBadge.textContent = 'Pilih Nasab Dahulu';
    genBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200';
    return;
  }

  try {
    const data = JSON.parse(parentSelect.value);
    if (data.targetGen === 2) {
      genBadge.textContent = 'G2 • Anak';
      genBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
    } else if (data.targetGen === 3) {
      genBadge.textContent = 'G3 • Cucu';
      genBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200';
    } else if (data.targetGen === 4) {
      genBadge.textContent = 'G4 • Cicit';
      genBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200';
    } else {
      genBadge.textContent = `G${data.targetGen}`;
      genBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200';
    }
  } catch (e) {
    genBadge.textContent = '-';
  }
}

function openAddMemberModal() {
  // 1. Cek otorisasi admin
  if (!window.isAdminAuthenticated) {
    if (typeof showAdminRestrictedAlert === 'function') {
      showAdminRestrictedAlert('Fitur tambah anggota hanya bisa diakses oleh admin, silakan menghubungi admin untuk menambahkan data anggota keluarga baru.');
    } else {
      alert('Fitur tambah anggota hanya bisa diakses oleh admin, silakan menghubungi admin untuk menambahkan data anggota keluarga baru.');
    }
    return;
  }

  const backdrop = document.getElementById('modal-add-member-backdrop');
  const card = document.getElementById('modal-add-member-card');
  const parentSelect = document.getElementById('form-add-member-parent');
  const nameInput = document.getElementById('form-add-member-name');
  const nicknameInput = document.getElementById('form-add-member-nickname');
  const spouseInput = document.getElementById('form-add-member-spouse');
  const birthdateInput = document.getElementById('form-add-member-birthdate');
  const isDeceasedInput = document.getElementById('form-add-member-deceased');

  if (!backdrop || !card) return;

  // Reset form inputs
  if (nameInput) nameInput.value = '';
  if (nicknameInput) nicknameInput.value = '';
  if (spouseInput) spouseInput.value = '';
  if (birthdateInput) birthdateInput.value = '';
  if (isDeceasedInput) isDeceasedInput.checked = false;

  // Populate list of parents
  if (parentSelect) {
    parentSelect.innerHTML = '<option value="">-- Pilih Orang Tua / Nasab Atas --</option>';

    // Opsi G1: Ibu Khotimah (Leluhur Utama)
    const g1Group = document.createElement('optgroup');
    g1Group.label = 'LELUHUR UTAMA (G1)';
    const g1Opt = document.createElement('option');
    g1Opt.value = JSON.stringify({
      targetGen: 2,
      targetRole: 'head',
      branchId: 1,
      parentId: null,
      parentName: 'Ibu Khotimah'
    });
    g1Opt.textContent = 'Ibu Khotimah (Leluhur Utama) → Calon G2 • Anak';
    g1Group.appendChild(g1Opt);
    parentSelect.appendChild(g1Group);

    // Opsi G2: Anak Kandung (Cabang 1 - 10)
    if (typeof familyData !== 'undefined' && Array.isArray(familyData) && familyData.length > 0) {
      const g2Group = document.createElement('optgroup');
      g2Group.label = 'GENERASI 2 (ANAK KANDUNG) → Calon G3 • Cucu';
      familyData.forEach(b => {
        if (b.heads && b.heads.length > 0) {
          b.heads.forEach(h => {
            const opt = document.createElement('option');
            const headDbId = h.id || (typeof rawMembersList !== 'undefined' && Array.isArray(rawMembersList) ? rawMembersList.find(r => r.branch_id === b.branchId && (r.name === h.name || r.generation === 1 || r.generation === 2))?.id : null);
            opt.value = JSON.stringify({
              targetGen: 3,
              targetRole: 'cucu',
              branchId: b.branchId,
              parentId: headDbId,
              parentName: h.name
            });
            const spouseInfo = h.spouse ? ` & ${h.spouse}` : '';
            opt.textContent = `Cabang ${b.branchId}: ${h.name}${spouseInfo} (G2 • Anak)`;
            g2Group.appendChild(opt);
          });
        }
      });
      parentSelect.appendChild(g2Group);

      // Opsi G3: Cucu-Cucu
      const g3Group = document.createElement('optgroup');
      g3Group.label = 'GENERASI 3 (CUCU) → Calon G4 • Cicit';
      familyData.forEach(b => {
        if (b.children && b.children.length > 0) {
          b.children.forEach(c => {
            const opt = document.createElement('option');
            const childDbId = c.id || (typeof rawMembersList !== 'undefined' && Array.isArray(rawMembersList) ? rawMembersList.find(r => r.branch_id === b.branchId && r.name === c.name)?.id : null);
            opt.value = JSON.stringify({
              targetGen: 4,
              targetRole: 'Cicit',
              branchId: b.branchId,
              parentId: childDbId,
              parentName: c.name
            });
            const spouseInfo = c.spouse ? ` & ${c.spouse}` : '';
            opt.textContent = `Cabang ${b.branchId}: ${c.name}${spouseInfo} (G3 • Cucu)`;
            g3Group.appendChild(opt);
          });
        }
      });
      parentSelect.appendChild(g3Group);
    }
  }

  // Update badge info default
  updateAddMemberGenInfo();

  // Buka modal
  backdrop.classList.remove('hidden');
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
  }, 10);
}

function closeAddMemberModal() {
  const backdrop = document.getElementById('modal-add-member-backdrop');
  const card = document.getElementById('modal-add-member-card');
  if (!backdrop || !card) return;

  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  card.classList.remove('scale-100');
  card.classList.add('scale-95');

  setTimeout(() => {
    backdrop.classList.add('hidden');
  }, 200);
}

async function handleSaveNewMember(event) {
  if (event) event.preventDefault();

  if (!window.isAdminAuthenticated) {
    if (typeof showAdminRestrictedAlert === 'function') {
      showAdminRestrictedAlert('Fitur simpan anggota baru hanya dapat diakses oleh admin.');
    }
    return;
  }

  const parentSelect = document.getElementById('form-add-member-parent');
  if (!parentSelect || !parentSelect.value) {
    if (typeof showToast === 'function') {
      showToast('Mohon pilih Orang Tua / Nasab Atas terlebih dahulu.', 'error');
    } else {
      alert('Mohon pilih Orang Tua / Nasab Atas terlebih dahulu.');
    }
    return;
  }

  let parentData;
  try {
    parentData = JSON.parse(parentSelect.value);
  } catch (e) {
    alert('Format data orang tua tidak valid.');
    return;
  }

  const nameInput = document.getElementById('form-add-member-name');
  const nicknameInput = document.getElementById('form-add-member-nickname');
  const spouseInput = document.getElementById('form-add-member-spouse');
  const birthdateInput = document.getElementById('form-add-member-birthdate');
  const isDeceasedInput = document.getElementById('form-add-member-deceased');
  const submitBtn = document.getElementById('btn-submit-add-member');

  const name = nameInput ? nameInput.value.trim() : '';
  const nickname = nicknameInput ? nicknameInput.value.trim() : '';
  const spouse = spouseInput ? spouseInput.value.trim() : '';
  const birthDate = birthdateInput ? birthdateInput.value : '';
  const isDeceased = isDeceasedInput ? isDeceasedInput.checked : false;

  if (!name) {
    if (typeof showToast === 'function') {
      showToast('Nama lengkap wajib diisi.', 'error');
    } else {
      alert('Nama lengkap wajib diisi.');
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Menyimpan ke Database...</span>';
  }

  try {
    const payload = {
      branch_id: parentData.branchId,
      name: name,
      spouse_name: spouse || null,
      generation: parentData.targetGen,
      role: parentData.targetRole,
      is_deceased: isDeceased,
      parent_id: parentData.parentId
    };

    if (birthDate) payload.birth_date = birthDate;
    if (nickname) payload.nickname = nickname;

    if (typeof supabase !== 'undefined' && supabase) {
      const { data: newRows, error } = await supabase
        .from('family_members')
        .insert([payload])
        .select();

      if (error) {
        console.error('Gagal simpan anggota ke Supabase:', error);
        if (typeof showToast === 'function') {
          showToast('Gagal menyimpan: ' + error.message, 'error');
        } else {
          alert('Gagal menyimpan: ' + error.message);
        }
        return;
      }

      if (newRows && newRows.length > 0) {
        const created = newRows[0];
        if (nickname || birthDate) {
          try {
            const localExtras = JSON.parse(localStorage.getItem('family_member_extras') || '{}');
            localExtras[created.id] = {
              nickname: nickname || null,
              birth_date: birthDate || null,
              photo_url: null
            };
            localStorage.setItem('family_member_extras', JSON.stringify(localExtras));
          } catch (e) {}
        }
      }
    }

    if (typeof fetchFamilyDataFromSupabase === 'function') {
      await fetchFamilyDataFromSupabase();
    }

    closeAddMemberModal();
    if (typeof showToast === 'function') {
      showToast(`Berhasil menambahkan "${name}" ke silsilah keluarga!`, 'success');
    }

  } catch (err) {
    console.error('Error saat menyimpan anggota:', err);
    if (typeof showToast === 'function') {
      showToast('Terjadi kesalahan koneksi database.', 'error');
    } else {
      alert('Terjadi kesalahan koneksi database.');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Simpan Anggota</span>';
    }
  }
}

// Attach globally
window.openAddMemberModal = openAddMemberModal;
window.closeAddMemberModal = closeAddMemberModal;
window.updateAddMemberGenInfo = updateAddMemberGenInfo;
window.handleSaveNewMember = handleSaveNewMember;


window.printOrExportPDF = function() {
  if (typeof triggerPrintDocument === 'function') triggerPrintDocument();
};
window.showAdminOnlyNotice = function() {
  if (typeof openAddMemberModal === 'function') openAddMemberModal();
};
