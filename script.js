const languageToggle = document.querySelector(".language-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const translatable = document.querySelectorAll("[data-ar][data-en]");
const metaDescription = document.querySelector('meta[name="description"]');
const menuList = document.querySelector(".menu-list");
const orderItems = document.querySelector(".order-items");
const cartCount = document.querySelector(".cart-count");
const customerName = document.querySelector(".customer-name");
const orderNotes = document.querySelector(".order-notes");
const orderSubmit = document.querySelector(".order-submit");
const cart = new Map();
const menuCatalog = {
  latte: { ar: "ماتشا لاتيه", en: "Matcha latte" },
  iced: { ar: "ماتشا مثلّجة", en: "Iced matcha" },
  pancakes: { ar: "فطائر", en: "Pancakes" }
};

function renderCart() {
  const language = document.documentElement.lang;
  const isEnglish = language === "en";
  const totalItems = [...cart.values()].reduce((total, quantity) => total + quantity, 0);
  cartCount.textContent = new Intl.NumberFormat(isEnglish ? "en" : "ar").format(totalItems);
  orderItems.replaceChildren();
  orderSubmit.disabled = totalItems === 0;

  if (totalItems === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = isEnglish
      ? "Choose an item from the menu to start your order."
      : "اختاروا صنفًا من القائمة لإضافته إلى طلبكم.";
    orderItems.append(emptyMessage);
    return;
  }

  for (const [key, quantity] of cart) {
    const row = document.createElement("div");
    row.className = "order-row";

    const name = document.createElement("span");
    name.className = "order-item-name";
    name.textContent = menuCatalog[key][language];

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.className = "quantity-button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", isEnglish ? `Remove one ${menuCatalog[key].en}` : `تقليل كمية ${menuCatalog[key].ar}`);
    decrease.addEventListener("click", () => changeQuantity(key, -1));

    const amount = document.createElement("span");
    amount.className = "quantity-value";
    amount.textContent = new Intl.NumberFormat(isEnglish ? "en" : "ar").format(quantity);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.className = "quantity-button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", isEnglish ? `Add one ${menuCatalog[key].en}` : `زيادة كمية ${menuCatalog[key].ar}`);
    increase.addEventListener("click", () => changeQuantity(key, 1));

    controls.append(decrease, amount, increase);
    row.append(name, controls);
    orderItems.append(row);
  }
}

function changeQuantity(key, change) {
  const quantity = (cart.get(key) || 0) + change;
  if (quantity < 1) cart.delete(key);
  else cart.set(key, quantity);
  renderCart();
}

languageToggle.addEventListener("click", () => {
  const isArabic = document.documentElement.lang === "ar";
  const language = isArabic ? "en" : "ar";
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? "ltr" : "rtl";
  document.body.lang = language;
  languageToggle.textContent = isArabic ? "عربي" : "EN";
  languageToggle.setAttribute("aria-label", isArabic ? "التبديل إلى العربية" : "Switch language");

  const seoContent = language === "en"
    ? {
        title: "Arlus's Matcha | Matcha cafe in Al Muzahimiyah",
        description: "Visit Arlus's matcha, a matcha cafe in Al Andalus, Al Muzahimiyah. Explore matcha and pancakes, order for pickup on WhatsApp, and get directions.",
        socialDescription: "Matcha and pancakes in Al Andalus, Al Muzahimiyah. Explore the menu and send a WhatsApp order."
      }
    : {
        title: "Arlus's Matcha | مقهى ماتشا في المزاحمية",
        description: "زوروا Arlus's matcha، مقهى ماتشا في حي الأندلس بالمزاحمية. اكتشفوا الماتشا والفطائر، اطلبوا للاستلام عبر واتساب، واعثروا على موقعنا.",
        socialDescription: "ماتشا وفطائر في حي الأندلس بالمزاحمية. اكتشفوا القائمة وأرسلوا طلبكم عبر واتساب."
      };
  document.title = seoContent.title;
  metaDescription.content = seoContent.description;
  document.querySelector('meta[property="og:title"]').content = seoContent.title;
  document.querySelector('meta[property="og:description"]').content = seoContent.socialDescription;
  document.querySelector('meta[property="og:locale"]').content = language === "en" ? "en_US" : "ar_SA";

  for (const element of translatable) {
    element.innerHTML = element.dataset[language];
  }

  document.querySelectorAll("[data-placeholder-ar]").forEach((element) => {
    element.placeholder = element.dataset[`placeholder${isArabic ? "En" : "Ar"}`];
  });
  renderCart();
});

menuList.addEventListener("click", (event) => {
  const button = event.target.closest(".menu-add");
  if (button) changeQuantity(button.dataset.item, 1);
});

orderSubmit.addEventListener("click", () => {
  if (cart.size === 0) return;

  const language = document.documentElement.lang;
  const isEnglish = language === "en";
  const lines = [
    isEnglish ? "New order from Arlus's matcha" : "طلب جديد من Arlus's matcha",
    `${isEnglish ? "Name" : "الاسم"}: ${customerName.value.trim() || (isEnglish ? "Not provided" : "غير مذكور")}`,
    "",
    isEnglish ? "Items:" : "الأصناف:",
    ...[...cart.entries()].map(([key, quantity]) => `- ${menuCatalog[key][language]} x ${quantity}`)
  ];

  const notes = orderNotes.value.trim();
  if (notes) lines.push("", `${isEnglish ? "Notes" : "ملاحظات"}: ${notes}`);
  lines.push("", isEnglish ? "Please confirm availability, price, and pickup time." : "برجاء تأكيد التوفر والسعر ووقت الاستلام.");
  const whatsappUrl = `https://wa.me/966502177436?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "فتح القائمة" : "إغلاق القائمة");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "فتح القائمة");
    siteNav.classList.remove("is-open");
  }
});