function addToCart() {
  const product = {
    name: "Lunera Pro Lamp™",
    price: 79.99
  };

  localStorage.setItem("cart", JSON.stringify(product));
  window.location.href = "cart.html";
}
