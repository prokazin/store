const tg = window.Telegram.WebApp;
tg.ready();

let catalog = []; // будет загружен с сервера
let cart = [];

const catalogDiv = document.getElementById("catalog");
const cartDiv = document.getElementById("cart");
const checkoutButton = document.getElementById("checkoutButton");
const adminContainer = document.getElementById("adminContainer");

// Функция рендера каталога
function renderCatalog() {
  catalogDiv.innerHTML = "";
  catalog.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>${item.price} ₽</strong></p>
      <button onclick="addToCart(${item.id})">Добавить в корзину</button>
    `;
    catalogDiv.appendChild(div);
  });
}

// Корзина
function renderCart() {
  cartDiv.innerHTML = "";
  if(cart.length === 0){ cartDiv.innerHTML="<p>Корзина пуста</p>"; return; }
  let total = 0;
  cart.forEach((item,index)=>{
    total += item.price;
    const div = document.createElement("div");
    div.className="cart-item";
    div.innerHTML = `<p>${item.name} - ${item.price} ₽</p>
      <button onclick="removeFromCart(${index})">Удалить</button>`;
    cartDiv.appendChild(div);
  });
  const totalDiv = document.createElement("div");
  totalDiv.style.marginTop="10px";
  totalDiv.innerHTML = `<strong>Итого: ${total} ₽</strong>`;
  cartDiv.appendChild(totalDiv);
}

function addToCart(id){
  const item = catalog.find(i => i.id === id);
  cart.push(item);
  renderCart();
}

function removeFromCart(index){
  cart.splice(index,1);
  renderCart();
}

// Отправка заказа
checkoutButton.addEventListener("click", async ()=>{
  if(cart.length === 0){ alert("Корзина пуста!"); return; }
  const orderText = cart.map(i => `${i.name} - ${i.price} ₽`).join("\n");
  const user = tg.initDataUnsafe.user;
  const fullOrder = `Новый заказ от ${user.first_name} (@${user.username||"без username"}):\n${orderText}`;
  const SERVER_URL = "https://ваш-сайт.vercel.app/send_order";

  try{
    const response = await fetch(SERVER_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({order:fullOrder})
    });
    if(response.ok){ alert("Заказ отправлен!"); cart=[]; renderCart(); }
    else alert("Ошибка отправки заказа");
  }catch(e){ alert("Ошибка соединения с сервером"); console.error(e);}
});

// --- Загрузка данных с сервера ---
async function loadData() {
  const SERVER_URL = "https://ваш-сайт.vercel.app/get_catalog";
  const userId = tg.initDataUnsafe.user?.id;

  try {
    const response = await fetch(SERVER_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId})
    });
    const data = await response.json();

    catalog = data.catalog;
    renderCatalog();

    if(data.isAdmin) {
      // Создаём админскую панель только для админа
      adminContainer.innerHTML = `
        <div id="adminPanel">
          <h2>Админпанель</h2>
          <input type="text" id="newName" placeholder="Название товара">
          <input type="text" id="newDescription" placeholder="Описание товара">
          <input type="number" id="newPrice" placeholder="Цена товара">
          <input type="text" id="newImg" placeholder="URL картинки">
          <button id="addItemButton">Добавить товар</button>
          <div id="adminCatalog"></div>
        </div>
      `;

      // Привязываем события
      const addItemButton = document.getElementById("addItemButton");
      const newName = document.getElementById("newName");
      const newDescription = document.getElementById("newDescription");
      const newPrice = document.getElementById("newPrice");
      const newImg = document.getElementById("newImg");
      const adminCatalogDiv = document.getElementById("adminCatalog");

      function renderAdminCatalog(){
        adminCatalogDiv.innerHTML = "";
        catalog.forEach((item,index)=>{
          const div = document.createElement("div");
          div.className="admin-item";
          div.innerHTML=`
            <img src="${item.img}" alt="${item.name}">
            <p>${item.name} - ${item.price} ₽</p>
            <p>${item.description}</p>
            <button onclick="deleteItem(${index})">Удалить</button>
          `;
          adminCatalogDiv.appendChild(div);
        });
      }

      window.deleteItem = async (index)=>{
        await fetch("https://ваш-сайт.vercel.app/delete_item",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({index:index,user_id:userId})
        });
        catalog.splice(index,1);
        renderCatalog();
        renderAdminCatalog();
      }

      addItemButton.addEventListener("click", async ()=>{
        const name = newName.value.trim();
        const description = newDescription.value.trim();
        const price = parseFloat(newPrice.value);
        const img = newImg.value.trim() || "https://via.placeholder.com/150";
        if(name && description && price){
          const response = await fetch("https://ваш-сайт.vercel.app/add_item",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({name,description,price,img,user_id:userId})
          });
          catalog.push({id:catalog.length+1,name,description,price,img});
          renderCatalog();
          renderAdminCatalog();
          newName.value=""; newDescription.value=""; newPrice.value=""; newImg.value="";
        }else alert("Введите все поля!");
      });

      renderAdminCatalog();
    }

  } catch(e){ console.error("Ошибка загрузки данных", e);}
}

loadData();
renderCart();
