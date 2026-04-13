async function loadData() {
  const res = await fetch("data.json");
  const data = await res.json();

  document.getElementById("app").innerHTML = data
    .map(item => `<div><strong>${item.name}</strong><br>${item.region}</div>`)
    .join("");
}

loadData();