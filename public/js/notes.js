function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function noteCard(note) {
  return `
    <article class="note-card">
      <h3>${escapeHtml(note.title)}</h3>
      <p class="note-meta">Owner: ${escapeHtml(note.ownerUsername)} | ID: ${note.id} | Pinned: ${note.pinned}</p>
      <div class="note-body">${escapeHtml(note.body)}</div>
    </article>
  `;
}

async function loadNotes(ownerId, search) {
  const query = new URLSearchParams();

 
  if (search) {
    query.set("search", search);
  }

  const result = await api(`/api/notes?${query.toString()}`);
  const notesList = document.getElementById("notes-list");
  notesList.innerHTML = result.notes.map(noteCard).join("");
}

(async function bootstrapNotes() {
  try {
    const user = await loadCurrentUser();

    if (!user) {
      document.getElementById("notes-list").textContent = "Please log in first.";
      return;
    }

    
    await loadNotes(user.id, "");
  } catch (error) {
    document.getElementById("notes-list").textContent = error.message;
  }
})();

document.getElementById("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  await loadNotes(null, formData.get("search"));
});

document.getElementById("create-note-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const payload = {
    title: formData.get("title"),
    body: formData.get("body"),
    pinned: formData.get("pinned") === "on"
  };

  await api("/api/notes", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  await loadNotes(payload.ownerId, "");
  event.currentTarget.reset();
});
