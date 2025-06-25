document.addEventListener("DOMContentLoaded", () => {
  // Initialize photo preview functionality
  const photoInput = document.getElementById("photo");
  if (photoInput) {
    photoInput.addEventListener("change", function(e) {
      const preview = document.getElementById("photo-preview");
      preview.innerHTML = "";
      preview.style.display = "none";
      
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = document.createElement("img");
          img.src = event.target.result;
          preview.appendChild(img);
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Show loading state
  const loading = document.getElementById('loading');
  const noResults = document.getElementById('no-results');
  
  // Simulate loading delay
  loading.style.display = 'flex';
  setTimeout(() => {
    loadItems();
    loading.style.display = 'none';
  }, 800);

  // Form submission
  document.getElementById("item-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state on button
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    const itemData = {
      name: document.getElementById("name").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      item: document.getElementById("item").value.trim(),
      location: document.getElementById("location").value.trim(),
      date: document.getElementById("date").value,
      type: document.getElementById("type").value,
      photo: document.getElementById("photo-preview").querySelector("img")?.src || null
    };

    setTimeout(() => {
      let items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
      items.push(itemData);
      localStorage.setItem("lostFoundItems", JSON.stringify(items));

      // Reset form
      e.target.reset();
      document.getElementById("photo-preview").innerHTML = "";
      document.getElementById("photo-preview").style.display = "none";
      
      // Show success message
      showMessage('Report submitted successfully!', 'success');
      
      // Restore button
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      
      // Reload items
      loadItems();
    }, 1000);
  });

  // Search functionality
  document.getElementById("search").addEventListener("input", function() {
    filterItems();
  });
});

function showMessage(message, type) {
  const messageEl = document.getElementById('form-message');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
  
  // Hide message after 5 seconds
  setTimeout(() => {
    messageEl.style.opacity = '0';
    setTimeout(() => {
      messageEl.style.display = 'none';
      messageEl.style.opacity = '1';
    }, 300);
  }, 5000);
}

function showForm(type) {
  document.getElementById("form-title").textContent = `Report ${type} Item`;
  document.getElementById("type").value = type;
  
  // Scroll to form
  document.getElementById('form-section').scrollIntoView({
    behavior: 'smooth'
  });
}

function filterItems(filterType = null) {
  const keyword = document.getElementById("search").value.toLowerCase();
  const cards = document.querySelectorAll(".item-card");
  const noResults = document.getElementById('no-results');
  let visibleCount = 0;
  
  // Update active filter button
  if (filterType) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.includes(filterType)) {
        btn.classList.add('active');
      }
    });
  } else {
    // If searching, use the current active filter
    const activeBtn = document.querySelector('.filter-btn.active');
    filterType = activeBtn.textContent === 'All' ? null : activeBtn.textContent;
  }
  
  cards.forEach(card => {
    const matchesSearch = card.innerText.toLowerCase().includes(keyword);
    const matchesFilter = !filterType || filterType === 'All' || 
                         card.querySelector('h3').textContent.includes(filterType);
    
    if (matchesSearch && matchesFilter) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });
  
  // Show/hide no results message
  noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

function loadItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  const items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
  
  if (items.length === 0) {
    document.getElementById('no-results').style.display = 'block';
    return;
  }
  
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>${item.type} Item</h3>
      ${item.photo ? `<img src="${item.photo}" alt="Item photo" class="item-photo">` : ''}
      <p><strong>Description:</strong> ${item.item}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Date:</strong> ${formatDate(item.date)}</p>
      <p><strong>Reported by:</strong> ${item.name}</p>
      <p><strong>Contact:</strong> ${item.contact}</p>
    `;
    list.appendChild(card);
  });
  
  // Update filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.textContent === 'All') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  filterItems();
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}