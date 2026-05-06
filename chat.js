import { auth, database } from "./firebase-config.js";
import { ref, set, push, onValue, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const storage = getStorage();

const searchInput = document.getElementById("searchUser");
const friendsList = document.getElementById("friendsList");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const chatWithName = document.getElementById("chatWithName");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const updateNameInput = document.getElementById("updateName");
const updatePicInput = document.getElementById("updatePic");
const profilePreview = document.getElementById("profilePreview");

let currentUser = null;
let currentChatFriend = null;

// Auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    profilePreview.src = currentUser.photoURL || "pic.jpg";
    loadFriends();
  } else window.location.href = "index.html";
});

// Load friends
function loadFriends() {
  const userChatsRef = ref(database, `chats/`);
  onValue(userChatsRef, (snapshot) => {
    friendsList.innerHTML = "";
    const chats = snapshot.val() || {};
    const friendIds = new Set();

    Object.keys(chats).forEach((chatId) => {
      if (chatId.includes(currentUser.uid)) {
        const parts = chatId.split("_");
        const friendId = parts[0] === currentUser.uid ? parts[1] : parts[0];
        friendIds.add(friendId);
      }
    });

    friendIds.forEach(async (fid) => {
      const snap = await get(ref(database, `users/${fid}`));
      if (snap.exists()) {
        const friend = snap.val();
        const div = document.createElement("div");
        div.classList.add("friend");
        div.innerHTML = `
          <img src="${friend.photoURL || "pic.jpg"}">
          <span>${friend.username || friend.email}</span>
        `;
        div.onclick = () => openChat(friend);
        friendsList.appendChild(div);
      }
    });
  });
}

// Search friends
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase();
  const snap = await get(ref(database, "users/"));
  friendsList.innerHTML = "";
  snap.forEach((childSnap) => {
    const friend = childSnap.val();
    if (friend.uid !== currentUser.uid &&
       (friend.username?.toLowerCase().includes(query) ||
        friend.email?.toLowerCase().includes(query))) {
      const div = document.createElement("div");
      div.classList.add("friend");
      div.innerHTML = `
        <img src="${friend.photoURL || "pic.jpg"}">
        <span>${friend.username || friend.email}</span>
      `;
      div.onclick = () => openChat(friend);
      friendsList.appendChild(div);
    }
  });
});

// Open chat
function openChat(friend) {
  currentChatFriend = friend;
  chatWithName.textContent = friend.username || friend.email;
  loadMessages(friend.uid);
}

// Load messages
function loadMessages(friendId) {
  const chatId = getChatId(currentUser.uid, friendId);
  const dbRef = ref(database, `chats/${chatId}`);

  onValue(dbRef, (snapshot) => {
    chatMessages.innerHTML = "";
    snapshot.forEach((childSnap) => {
      const msg = childSnap.val();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      msgDiv.classList.add(msg.senderId === currentUser.uid ? "sent" : "received");
      const time = new Date(msg.timestamp).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
      msgDiv.innerHTML = `
        <img src="${msg.senderPic || "pic.jpg"}">
        <div class="message-content">
          <span>${msg.text}</span>
          <div class="timestamp">${time}</div>
        </div>
      `;
      chatMessages.appendChild(msgDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Send message
sendBtn.addEventListener("click", () => {
  if (!currentChatFriend) return showToast("Select a friend first");
  const text = messageInput.value.trim();
  if (!text) return;

  const chatId = getChatId(currentUser.uid, currentChatFriend.uid);
  const dbRef = ref(database, `chats/${chatId}`);
  const newMsgRef = push(dbRef);

  set(newMsgRef, {
    senderId: currentUser.uid,
    senderName: currentUser.displayName || currentUser.email,
    senderPic: currentUser.photoURL || "pic.jpg",
    text,
    timestamp: Date.now(),
  });

  messageInput.value = "";
});

// Generate chat ID
function getChatId(uid1, uid2) { return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`; }

// Toggle settings
settingsBtn.addEventListener("click", () => settingsPanel.classList.add("active"));
closeSettingsBtn.addEventListener("click", () => settingsPanel.classList.remove("active"));

// Profile pic preview
updatePicInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) profilePreview.src = URL.createObjectURL(file);
});

// Save profile changes
saveProfileBtn.addEventListener("click", async () => {
  const newName = updateNameInput.value.trim();
  const file = updatePicInput.files[0];
  let photoURL = currentUser.photoURL;

  try {
    if (file) {
      const storageRef = sRef(storage, `profilePics/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(currentUser, { displayName: newName || currentUser.displayName, photoURL });
    await update(ref(database, `users/${currentUser.uid}`), { username: newName || currentUser.displayName, photoURL });

    profilePreview.src = photoURL;
    loadFriends();
    if (currentChatFriend && currentChatFriend.uid === currentUser.uid) {
      chatWithName.textContent = newName || currentUser.displayName;
    }
    if (currentChatFriend) loadMessages(currentChatFriend.uid);

    showToast("Profile updated!");
    settingsPanel.classList.remove("active");
  } catch (err) {
    console.error(err);
    showToast("Error updating profile");
  }
});

// Logout
logoutBtn.addEventListener("click", async () => { await signOut(auth); window.location.href="index.html"; });

// Toast helper
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
