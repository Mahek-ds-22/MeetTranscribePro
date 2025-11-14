document.getElementById("generate-summary").onclick = async () => {
  const res = await fetch("/api/summary/1/generate", { method: "POST" });
  const json = await res.json();
  document.getElementById("output").innerText =
    "SUMMARY GENERATED:\n" + JSON.stringify(json, null, 2);
};
