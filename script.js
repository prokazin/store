// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();

// Админский ID
const ADMIN_ID = 123456789; // замените на свой Telegram ID
const userId = tg.initDataUnsafe.user?.id;
const isAdmin = userId === ADMIN_ID;

if(isAdmin) document.getElementById("adminPanel").style.display = "block";

// Каталог
let catalog = JSON.parse(localStorage.getItem("catalog")) || [
  {id:1, name:"Товар 1", description:"Описание товара 1", price:500, img:"https://via.placeholder.com/150"}
];

let cart = [];

const catalogDiv = document.getElementById("catalog");
const cartDiv = document.getElementById("cart");
const checkoutButton = document.getElementById("checkoutButton");

// Рендер каталога с описанием
function renderCatalog(){
  catalogDiv.innerHTML="";
  catalog.forEach(item=>{
    const div = document.createElement("div");
    div.className="item";
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

// Рендер корзины
function renderCart(){
  cartDiv.innerHTML="";
  if(cart.length===0){ cartDiv.innerHTML="<p>Корзина пуста</p>"; return; }
  let total=0;
  cart.forEach((item,index)=>{
    total += item.price;
    const div = document.createElement("div");
    div.className="cart-item";
    div.innerHTML=`<p>${item.name} - ${item.price} ₽</p>
      <button onclick="removeFromCart(${index})">Удалить</button>`;
    cartDiv.appendChild(div);
  });
  const totalDiv = document.createElement("div");
  totalDiv.style.marginTop = "10px";
  totalDiv.innerHTML=`<strong>Итого: ${total} ₽</strong>`;
  cartDiv.appendChild(totalDiv);
}

// Добавление в корзину
function addToCart(id){
  const item = catalog.find(i => i.id===id);
  cart.push(item);
  renderCart();
}

// Удаление из корзины
function removeFromCart(index){
  cart.splice(index,1);
  renderCart();
}

// Отправка заказа админу
checkoutButton.addEventListener("click", async ()=>{
  if(cart.length===0){ alert("Корзина пуста!"); return; }
  const orderText = cart.map(i=>`${i.name} - ${i.price} ₽`).join("\n");
  const user = tg.initDataUnsafe.user;
  const fullOrder = `Новый заказ от ${user.first_name} (@${user.username||"без username"}):\n${orderText}`;
  const SERVER_URL = "https://ваш-сайт.vercel.app/send_order"; // замените на URL вашего сервера
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

// Админка
if(isAdmin){
  const adminCatalogDiv=document.getElementById("adminCatalog");
  const addItemButton=document.getElementById("addItemButton");
  const newName=document.getElementById("newName");
  const newDescription=document.getElementById("newDescription");
  const newPrice=document.getElementById("newPrice");
  const newImg=document.getElementById("newImg");

  function renderAdminCatalog(){
    adminCatalogDiv.innerHTML="";
    catalog.forEach((item,index)=>{
      const div=document.createElement("div");
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

  addItemButton.addEventListener("click", ()=>{
    const name=newName.value.trim();
    const description=newDescription.value.trim();
    const price=parseFloat(newPrice.value);
    const img=newImg.value.trim() || "https://via.placeholder.com/150";

    if(name && description && price){
      const id = catalog.length ? catalog[catalog.length-1].id +1 :1;
      catalog.push({id,name,description,price,img});
      localStorage.setItem("catalog",JSON.stringify(catalog));
      renderCatalog(); renderAdminCatalog();
      newName.value=""; newDescription.value=""; newPrice.value=""; newImg.value="";
    }else alert("Введите все поля!");
  });

  window.deleteItem = (index)=>{
    catalog.splice(index,1);
    localStorage.setItem("catalog",JSON.stringify(catalog));
    renderCatalog(); renderAdminCatalog();
  }

  renderAdminCatalog();
}

renderCatalog();
renderCart();
