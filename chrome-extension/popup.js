console.log("START");
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

// Function that creates the popup
function createPopup() {
  const container = document.createElement('div');
  container.style.all = 'initial';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '2147483647';
  container.style.width = '340px';

  const shadowRoot = container.attachShadow({ mode: 'closed' });

  // Create a <style> element to hold external CSS
  const styleElement = document.createElement('style');

  // Fetch the CSS file
  fetch(chrome.runtime.getURL('popup.css'))
    .then(response => response.text())
    .then(css => {
      styleElement.textContent = css;
      shadowRoot.appendChild(styleElement);
    })
    .catch(err => console.error('Failed to load CSS:', err));

  // Create the popup content
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <h2>Terrafin found better deals!</h2>
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <button id="activateBtn">Create a ticket</button>
  `;
  shadowRoot.appendChild(popup);

  document.documentElement.appendChild(container);
}

setTimeout(() => {
  console.log("CHECKING PAGE FOR ADD TO CART...");
  if (hasAddToCartButton()) {
    createPopup();
  } else {
    console.log('Not a product page — no Add to Cart button found.');
  }
}, 2000);

console.log("END");