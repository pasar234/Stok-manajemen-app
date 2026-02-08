// Fungsi untuk edit harga produk
function showEditPriceModal(id) {
    const produk = database.find(x => x.id === id);
    if (!produk) return;
    
    // Buat modal untuk edit harga
    const modalHTML = `
        <div class="modal show" id="editPriceModal">
            <div class="modal-content">
                <h2>Edit Harga Produk</h2>
                <p><strong>${escapeHtml(produk.nama)}</strong></p>
                
                <div class="form-group">
                    <label for="editHargaBeli">Harga Beli</label>
                    <input type="number" id="editHargaBeli" class="form-input" 
                           value="${produk.beli}" min="0" placeholder="Harga beli">
                </div>
                
                <div class="form-group">
                    <label for="editHargaJual">Harga Jual</label>
                    <input type="number" id="editHargaJual" class="form-input" 
                           value="${produk.jual}" min="0" placeholder="Harga jual" required>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-outline" id="cancelEditBtn">Batal</button>
                    <button class="btn-primary" id="saveEditBtn" data-id="${id}">Simpan</button>
                </div>
            </div>
        </div>
    `;
    
    // Tambahkan modal ke body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event listeners untuk modal
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('editPriceModal').remove();
    });
    
    document.getElementById('saveEditBtn').addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const newBeli = parseInt(document.getElementById('editHargaBeli').value) || 0;
        const newJual = parseInt(document.getElementById('editHargaJual').value);
        
        if (!newJual || newJual <= 0) {
            showToast('Harga jual harus diisi!', 'error');
            return;
        }
        
        const index = database.findIndex(x => x.id === id);
        if (index !== -1) {
            database[index].beli = newBeli;
            database[index].jual = newJual;
            saveToLocalStorage();
            renderData();
            showToast('✅ Harga berhasil diupdate', 'success');
        }
        
        document.getElementById('editPriceModal').remove();
    });
    
    // ESC untuk close modal
    document.addEventListener('keydown', function closeModal(e) {
        if (e.key === 'Escape') {
            document.getElementById('editPriceModal').remove();
            document.removeEventListener('keydown', closeModal);
        }
    });
}

// PERBAIKAN fungsi renderData() - GANTI dengan kode ini:
function renderData() {
    if (!currentCategory) return;
    
    const search = searchInput.value.toLowerCase();
    const filteredData = database.filter(item => 
        item.kategori === currentCategory && 
        (item.nama.toLowerCase().includes(search) || 
         item.kode.toLowerCase().includes(search))
    );
    
    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        listContainer.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by name
    filteredData.sort((a, b) => a.nama.localeCompare(b.nama));
    
    listContainer.innerHTML = filteredData.map(item => `
        <div class="product-card" data-id="${item.id}">
            <div class="product-main-info">
                <div class="product-details">
                    <h3 class="product-title">${escapeHtml(item.nama)}</h3>
                    <div class="product-code-price">
                        <div class="product-code">Kode: ${escapeHtml(item.kode)}</div>
                        <div class="product-price-container">
                            <div class="product-price" onclick="showEditPriceModal(${item.id})">
                                Jual: ${formatRupiah(item.jual)}
                            </div>
                            <button class="edit-price-btn" onclick="showEditPriceModal(${item.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                        <div style="font-size: 13px; color: var(--text-light); margin-top: 4px;">
                            Beli: ${formatRupiah(item.beli)}
                        </div>
                    </div>
                </div>
                
                <div class="product-actions">
                    <div class="stock-control-side">
                        <div class="stock-label">STOK</div>
                        <div class="stock-value">${item.stok}</div>
                        <div class="stock-buttons">
                            <button class="stock-btn" onclick="ubahStok(${item.id}, -1)">-</button>
                            <button class="stock-btn" onclick="ubahStok(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    
                    <button class="delete-btn-side" onclick="showDeleteConfirm(${item.id})">
                        <i class="fas fa-trash"></i> Hapus Produk
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
