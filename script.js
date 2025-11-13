const tg = window.Telegram.WebApp;
tg.ready();

// Админский ID
const ADMIN_ID = 123456789; // замените на свой Telegram ID
const userId = tg.initDataUnsafe.user?.id;
const isAdmin = userId === ADMIN_ID;
if(isAdmin) document.getElementById("adminPanel").style.display = "block";

// Каталог товаров с картинками
let catalog = JSON.parse(localStorage.getItem("catalog")) || [
  { id: 1, name: "Товар 1", price: 500, img:"https://via.placeholder.com/150" },
  { id: 2, name: "Товар 2", price: 1200, img:"https://via.placeholder.com/150" },
  { id: 3, name: "Товар 3", price: 800, img:"https://via.placeholder.com/150" }
];

let cart = [];

const catalogDiv = document.getElementById("catalog");
const cartDiv = document.getElementById("cart");
const checkoutButton = document.getElementById("checkoutButton");

// Рендер каталога
function renderCatalog(){
  catalogDiv.innerHTML="";
  catalog.forEach(item=>{
    const div=document.createElement("div");
    div.className="item";
    div.innerHTML=`<img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.price} ₽</p>
      <button onclick="addToCart(${item.id})">Добавить в корзину</button>`;
    catalogDiv.appendChild(div);
  });
}

// Рендер корзины
function renderCart(){
  cartDiv.innerHTML="";
  if(cart.length===0){ cartDiv.innerHTML="<p>Корзина пуста</p>"; return; }
  let total=0;
  cart.forEach((item,index)=>{
    total+=item.price;
    const div=document.createElement("div");
    div.className="cart-item";
    div.innerHTML=`<p>${item.name} - ${item.price} ₽</p>
      <button onclick="removeFromCart(${index})">Удалить</button>`;
    cartDiv.appendChild(div);
  });
  const totalDiv=document.createElement("div");
  totalDiv.style.marginTop="10px";
  totalDiv.innerHTML=`<strong>Итого: ${total} ₽</strong>`;
  cartDiv.appendChild(totalDiv);
}

function addToCart(id){
  const item=catalog.find(i=>i.id===id);
  cart.push(item);
  renderCart();
}

function removeFromCart(index){
  cart.splice(index,1);
  renderCart();
}

// Отправка заказа администратору
checkoutButton.addEventListener("click", async ()=>{
  if(cart.length===0){ alert("Корзина пуста!"); return; }
  const orderText = cart.map(i=>`${i.name} - ${i.price} ₽`).join("\n");
  const user = tg.initDataUnsafe.user;
  const fullOrder = `Новый заказ от ${user.first_name} (@${user.username||"без username"}):\n${orderText}`;
  const response = await fetch("/send_order", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({order:fullOrder})
  });
  if(response.ok){ alert("Заказ отправлен администратору!"); cart=[]; renderCart(); }
  else alert("Ошибка отправки заказа");
});

// Админка
if(isAdmin){
  const adminCatalogDiv=document.getElementById("adminCatalog");
  const addItemButton=document.getElementById("addItemButton");
  const newName=document.getElementById("newName");
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
        <button onclick="deleteItem(${index})">Удалить</button>`;
      adminCatalogDiv.appendChild(div);
    });
  }

  addItemButton.addEventListener("click", ()=>{
    const name=newName.value.trim();
    const price=parseFloat(newPrice.value);
    const img=newImg.value.trim() || "https://via.placeholder.com/150";
    if(name && price){
      const id=catalog.length ? catalog[catalog.length-1].id+1 :1;
      catalog.push({id,name,price,img});
      localStorage.setItem("catalog",JSON.stringify(catalog));
      renderCatalog(); renderAdminCatalog();
      newName.value=""; newPrice.value=""; newImg.value="";
    }else alert("Введите название, цену и URL картинки");
  });

  window.deleteItem=(index)=>{
    catalog.splice(index,1);
    localStorage.setItem("catalog",JSON.stringify(catalog));
    renderCatalog(); renderAdminCatalog();
  }

  renderAdminCatalog();
}

renderCatalog(); renderCart();
