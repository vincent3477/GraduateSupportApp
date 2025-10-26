const users = [];

export function userJoin(id, username, room) {
  const cleanRoom = typeof room === "string" ? room.trim() : room;
  const cleanName = typeof username === "string" ? username.trim() : "";
  const displayName = cleanName || "Friend";

  const existingIndex = users.findIndex((user) => user.id === id);
  if (existingIndex !== -1) {
    const previous = users[existingIndex];
    const updated = { ...previous, username: displayName, room: cleanRoom ?? previous.room };
    const roomChanged = previous.room !== updated.room;
    users[existingIndex] = updated;
    return { user: updated, isNewJoin: roomChanged };
  }

  const user = { id, username: displayName, room: cleanRoom };
  users.push(user);
  return { user, isNewJoin: true };
}

export function getCurrentUser(id) {
  return users.find((user) => user.id === id) ?? null;
}

export function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = users.splice(index, 1);
  return removed;
}

export function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}
