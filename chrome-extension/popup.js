// Function to detect presence of an "Add to Cart" or similar button
function hasAddToCartButton() {
  const buttons = document.querySelectorAll('button');
  for (const button of buttons) {
    const text = button.innerText.toLowerCase();
    if (
      text.includes('add to cart') ||
      text.includes('buy now') ||
      text.includes('add to bag') ||
      text.includes('purchase') ||
      text.includes('add to shopping bag') ||
      text.includes('place in bag') ||
      text.includes('place in cart')
    ) {
      return true;
    }
  }
  return false;
}

function cleanProductUrl(url) {
  const urlObj = new URL(url);

  // These are common tracking parameters you likely want to remove
  const paramsToRemove = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'gbraid',
    'gad_source',
    'gclsrc',
    'utm_source_platform',
    'utm_id'
  ];

  for (const param of paramsToRemove) {
    urlObj.searchParams.delete(param);
  }

  return urlObj.toString();
}

// Function that creates the popup
function createPopup(item_id) {
  const container = document.createElement('div');
  container.style.all = 'initial';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '2147483647';
  container.style.width = '340px';

  const shadowRoot = container.attachShadow({ mode: 'closed' });

  // Load and apply CSS
  const styleElement = document.createElement('style');
  fetch(chrome.runtime.getURL('popup.css'))
    .then(response => response.text())
    .then(css => {
      styleElement.textContent = css;
      shadowRoot.appendChild(styleElement);
    })
    .catch(err => console.error('Failed to load CSS:', err));

  // Create popup HTML
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <button class="close-btn" id="closePopupBtn">&times;</button>
    <h2>Silk found better deals!</h2>
    <button id="activateBtn">Create a ticket</button>
  `;
  shadowRoot.appendChild(popup);

  // Wait until DOM is rendered to attach event listeners
  setTimeout(() => {
    const activateBtn = shadowRoot.getElementById('activateBtn');
    if (activateBtn) {
      activateBtn.addEventListener('click', () => {
        const targetUrl = `http://localhost:5173/Create/${item_id}/1`;
        window.open(targetUrl, '_blank');
      });
    }

    const closeBtn = shadowRoot.getElementById('closePopupBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.remove();
      });
    }
  }, 0);

  document.documentElement.appendChild(container);
}

function createFailedPopup() {
  const container = document.createElement('div');
  container.style.all = 'initial';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '2147483647';
  container.style.width = '340px';

  const shadowRoot = container.attachShadow({ mode: 'closed' });

  // Create and apply CSS
  const styleElement = document.createElement('style');
  fetch(chrome.runtime.getURL('popup.css'))
    .then(response => response.text())
    .then(css => {
      styleElement.textContent = css;
      shadowRoot.appendChild(styleElement);
    })
    .catch(err => console.error('Failed to load CSS:', err));

  // Create popup content
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <button class="close-btn" id="closePopupBtn">&times;</button>
    <h2>You have the best deal!</h2>
    <p>Silk couldn't find another cheaper price.</p>
  `;
  shadowRoot.appendChild(popup);

  // Attach close button listener
  setTimeout(() => {
    const closeBtn = shadowRoot.getElementById('closePopupBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.remove();
      });
    }
  }, 0);

  document.documentElement.appendChild(container);
}



setTimeout(() => {
  console.log("CHECKING PAGE FOR ADD TO CART...");
  
  if (hasAddToCartButton()) {
    console.log("[TERRAFIN] Sending request to backend");

    const link = cleanProductUrl(window.location.href);

    fetch(`http://localhost:3000/api/screenshot?link=${encodeURIComponent(link)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('GET Response:', data);
        const itemId = data.item_id;
        createPopup(itemId);
      })
      .catch(err => {
        console.error('GET Error:', err);
        createFailedPopup();
      });

  } else {
    console.log('Not a product page — no Add to Cart button found.');
  }
}, 2000);


