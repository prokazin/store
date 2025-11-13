document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      contents.forEach(c => c.classList.remove('active'));
      const activeTab = document.getElementById(tab.dataset.tab);
      activeTab.classList.add('active');
    });
  });

  // Пример товаров для каталога
  const productList = document.getElementById('product-list');
  const products = [
    {name: 'Товар 1', price: '1000', image: 'https://via.placeholder.com/150'},
    {name: 'Товар 2', price: '1500', image: 'https://via.placeholder.com/150'},
    {name: 'Товар 3', price: '2000', image: 'https://via.placeholder.com/150'}
  ];

  products.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Цена: ${p.price} ₽</p>
      <button onclick="addToCart(${index})">Добавить в корзину</button>
    `;
    productList.appendChild(div);
  });

  // Корзина
  let cart = [];
  window.addToCart = function(index) {
    cart.push(products[index]);
    renderCart();
    alert(`${products[index].name} добавлен в корзину`);
  }

  const cartItemsDiv = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('checkout');

  function renderCart() {
    cartItemsDiv.innerHTML = '';
    cart.forEach((item, i) => {
      const div = document.createElement('div');
      div.innerHTML = `${item.name} — ${item.price} ₽ <button onclick="removeFromCart(${i})">❌</button>`;
      cartItemsDiv.appendChild(div);
    });
  }

  window.removeFromCart = function(i) {
    cart.splice(i, 1);
    renderCart();
  }

  checkoutBtn.onclick = () => {
    if(cart.length === 0) return alert('Корзина пустая!');
    alert('Заказ оформлен!');
    cart = [];
    renderCart();
    tabs[0].click(); // Переключаем на каталог
  }

  // Активируем первую вкладку по умолчанию
  tabs[0].click();
});
