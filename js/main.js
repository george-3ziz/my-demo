document.body.style.direction = "rtl";

const sectionSelect = document.getElementById("section-select");
const loadBtn = document.getElementById("load-section");
const sectionArea = document.getElementById("section-area");

loadBtn.addEventListener("click", () => {
  const section = sectionSelect.value;
  renderSection(section);
});

function renderSection(section) {
  sectionArea.innerHTML = "";

  const sectionTitle = {
    clients: "العملاء",
    stock: "المخزون",
  };

  const title = document.createElement("h2");
  title.textContent = sectionTitle[section];
  sectionArea.appendChild(title);

  if (section === "stock") {
    renderStockSection();
  } else if (section === "clients") {
    renderClientsSection();
  } else {
    renderSimpleSection(section);
  }
}

function renderSimpleSection(section) {
  const data = getData(section);
  const list = document.createElement("ul");
  data.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  sectionArea.appendChild(list);
}

function renderStockSection() {
  sectionArea.innerHTML += `
    <input placeholder="اسم المنتج" id="stock-name">
    <input type="number" placeholder="سعر المنتج" id="stock-price">
    <input type="number" placeholder="الكمية" id="stock-quantity">
    <button id="stock-add">إضافة</button>
    <table class="compact-table">
      <thead>
        <tr>
          <th>المسلسل</th>
          <th>اسم المنتج</th>
          <th>السعر</th>
          <th>الكمية</th>
          <th>الإجمالي</th>
          <th>تعديل</th>
          <th>حذف</th>
        </tr>
      </thead>
      <tbody id="stock-body"></tbody>
    </table>
  `;

  const inputName = document.getElementById("stock-name");
  const inputPrice = document.getElementById("stock-price");
  const inputQuantity = document.getElementById("stock-quantity");
  const addBtn = document.getElementById("stock-add");
  const tbody = document.getElementById("stock-body");

  addBtn.onclick = () => {
    const name = inputName.value.trim();
    const price = parseFloat(inputPrice.value);
    const quantity = parseInt(inputQuantity.value);

    if (!name || isNaN(price) || isNaN(quantity)) {
      alert("يرجى إدخال جميع البيانات بشكل صحيح");
      return;
    }

    const data = getData("stock");
    data.push({ name, price, quantity });
    saveData("stock", data);

    updateStockTable();
    inputName.value = "";
    inputPrice.value = "";
    inputQuantity.value = "";
  };

  function updateStockTable() {
    tbody.innerHTML = "";
    const data = getData("stock");

    data.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td>${item.quantity}</td>
        <td>${item.price * item.quantity}</td>
        <td><button data-index="${index}" class="delete-stock">❌</button></td>
        <td><button data-index="${index}" class="updat-stock">✏️</button></td>
      `;
      tbody.appendChild(row);
    });

    document.querySelectorAll(".delete-stock").forEach((btn) => {
      btn.onclick = () => {
        const index = btn.getAttribute("data-index");
        const data = getData("stock");
        data.splice(index, 1);
        saveData("stock", data);
        updateStockTable();
      };
    });
    document.querySelectorAll(".updat-stock").forEach((btn) => {
      btn.onclick = () => {
        const index = btn.getAttribute("data-index"); // <-- هنا كانت المشكلة
        const data = getData("stock");
        const item = data[index];

        // تعبئة الحقول بالقيم القديمة
        document.getElementById("stock-name").value = item.name;
        document.getElementById("stock-price").value = item.price;
        document.getElementById("stock-quantity").value = item.quantity;

        // حذف العنصر من البيانات
        data.splice(index, 1);
        saveData("stock", data);

        // تحديث الجدول
        if (typeof window.updateStockTable === "function") {
          window.updateStockTable();
        }
      };
    });
  }

  updateStockTable();
}

function renderClientsSection() {
  sectionArea.innerHTML += `
    <input placeholder="اسم الزبون" id="client-name">
    <input placeholder="المنتج" id="client-product">
    <input type="number" placeholder="سعر المنتج" id="client-price">
    <input type="number" placeholder="عدد الأقساط" id="client-installments">
    <button id="client-add">إضافة عميل</button>
    <table class="compact-table">
      <thead>
        <tr>
          <th>المسلسل</th>
          <th>اسم الزبون</th>
          <th>المنتج</th>
          <th>سعر المنتج</th>
          <th>عدد الأقساط</th>
          <th>الجزء الشهري</th>
          <th>الأقساط المدفوعة</th>
          <th>الأقساط المتأخرة</th>
          <th>المتبقي</th>
          <th>الإجراء</th>
          <th>حذف</th>
        </tr>
      </thead>
      <tbody id="client-body"></tbody>
    </table>
  `;

  const inputName = document.getElementById("client-name");
  const inputProduct = document.getElementById("client-product");
  const inputPrice = document.getElementById("client-price");
  const inputInstallments = document.getElementById("client-installments");
  const addBtn = document.getElementById("client-add");
  const tbody = document.getElementById("client-body");

  addBtn.onclick = () => {
    const name = inputName.value.trim();
    const product = inputProduct.value.trim();
    const price = parseFloat(inputPrice.value);
    const installments = parseInt(inputInstallments.value);

    if (
      !name ||
      !product ||
      isNaN(price) ||
      isNaN(installments) ||
      installments === 0
    ) {
      alert("يرجى إدخال جميع البيانات بشكل صحيح");
      return;
    }

    const monthly = parseFloat((price / installments).toFixed(2));
    const data = getData("clients");
    data.push({
      name,
      product,
      price,
      installments,
      monthly,
      paid: 0,
      late: installments,
    });
    saveData("clients", data);

    updateClientsTable();
    inputName.value = "";
    inputProduct.value = "";
    inputPrice.value = "";
    inputInstallments.value = "";
  };

  function updateClientsTable() {
    tbody.innerHTML = "";
    const data = getData("clients");
    data.forEach((client, index) => {
      const remaining = (
        client.monthly *
        (client.installments - client.paid)
      ).toFixed(2);
      const row = document.createElement("tr");

      if (client.late === 0) {
        row.style.backgroundColor = "#cce5ff";
      } else if (new Date().getDate() > 5 && client.late > 0) {
        row.style.backgroundColor = "#fdd";
      } else {
        row.style.backgroundColor = "#dfd";
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${client.name}</td>
        <td>${client.product}</td>
        <td>${(client.monthly * client.installments).toFixed(2)}</td>
        <td>${client.installments}</td>
        <td>${client.monthly}</td>
        <td>${client.paid}</td>
        <td>${client.late}</td>
        <td>${remaining}</td>
        <td>
          <button class="pay-installment  fw-bolder" data-index="${index}" style="background-color: green; color: white;">💰 دفـع</button>
          <button class="undo-installment fw-light" data-index="${index}" style="background-color: red; color: white;">↩️ استرجاع</button>
        </td>
        <td><button class="delete-client fw-light" data-index="${index}">❌</button></td>
      `;

      tbody.appendChild(row);
    });

    document.querySelectorAll(".pay-installment").forEach((btn) => {
      btn.onclick = () => {
        const index = btn.getAttribute("data-index");
        const data = getData("clients");
        const client = data[index];
        if (client.late > 0) {
          client.late--;
          client.paid++;
        }
        saveData("clients", data);
        updateClientsTable();
      };
    });

    document.querySelectorAll(".undo-installment").forEach((btn) => {
      btn.onclick = () => {
        const index = btn.getAttribute("data-index");
        const data = getData("clients");
        const client = data[index];
        if (client.paid > 0) {
          client.paid--;
          client.late++;
        }
        saveData("clients", data);
        updateClientsTable();
      };
    });

    document.querySelectorAll(".delete-client").forEach((btn) => {
      btn.onclick = () => {
        const index = btn.getAttribute("data-index");
        const data = getData("clients");
        data.splice(index, 1);
        saveData("clients", data);
        updateClientsTable();
      };
    });
  }

  updateClientsTable();
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// CSS
const style = document.createElement("style");
style.innerHTML = `
  .compact-table {
    font-size: 12px;
    border-collapse: collapse;
    width: 100%;
  }
  .compact-table th, .compact-table td {
    padding: 4px 6px;
    border: 1px solid #ccc;
    text-align: center;
  }
  input {
    font-size: 14px;
    margin: 2px;
    padding: 4px;
  }
  button {
    font-size: 12px;
    margin: 2px;
    padding: 4px 6px;
  }
`;
document.head.appendChild(style);

//  ^ alagmaly

function showLiveMiniSums() {
  // إنشاء العناصر الجانبية لو مش موجودة
  let miniOut = document.getElementById("mini-out");
  if (!miniOut) {
    miniOut = document.createElement("div");
    miniOut.id = "mini-out";
    miniOut.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 100px;
      background: #ffdede;
      color: #000;
      font-size: 11px;
      text-align: center;
      padding: 6px;
      z-index: 2000;
      border: 1px solid #ccc;
      line-height: 1.4;
    `;
    miniOut.innerHTML = `<div style="font-weight:bold;">💰 العملاء</div><div id="mini-out-val">0</div>`;
    document.body.appendChild(miniOut);
  }

  let miniStock = document.getElementById("mini-stock");
  if (!miniStock) {
    miniStock = document.createElement("div");
    miniStock.id = "mini-stock";
    miniStock.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100px;
      background: #deffde;
      color: #000;
      font-size: 11px;
      text-align: center;
      padding: 6px;
      z-index: 2000;
      border: 1px solid #ccc;
      line-height: 1.4;
    `;
    miniStock.innerHTML = `<div style="font-weight:bold;">📦 المخزون</div><div id="mini-stock-val">0</div>`;
    document.body.appendChild(miniStock);
  }

  function updateValues() {
    const clients = JSON.parse(localStorage.getItem("clients")) || [];
    const stock = JSON.parse(localStorage.getItem("stock")) || [];

    // حساب المتبقي من العملاء
    const totalClients = clients.reduce((sum, c) => {
      const monthly = c.monthly || c.price / c.installments;
      const remaining = monthly * (c.installments - c.paid);
      return sum + remaining;
    }, 0);

    // حساب إجمالي المخزون
    const totalStock = stock.reduce((sum, s) => sum + s.price * s.quantity, 0);

    // تحديث العناصر الصغيرة
    document.getElementById(
      "mini-out-val"
    ).textContent = `${totalClients.toFixed(0)} ج`;
    document.getElementById(
      "mini-stock-val"
    ).textContent = `${totalStock.toFixed(0)} ج`;

    // تحديث الشريط العلوي لو موجود
    const totalClientsSpan = document.getElementById("total-clients");
    const totalStockSpan = document.getElementById("total-stock");
    if (totalClientsSpan)
      totalClientsSpan.textContent = `💰 المتبقي: ${totalClients.toFixed(
        2
      )} جنيه`;
    if (totalStockSpan)
      totalStockSpan.textContent = `📦 قيمة المخزون: ${totalStock.toFixed(
        2
      )} جنيه`;
  }

  updateValues();
  setInterval(updateValues, 1000);
}

showLiveMiniSums();
