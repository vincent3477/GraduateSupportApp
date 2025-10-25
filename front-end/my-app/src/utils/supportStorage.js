export const LS_KEYS = {
  user: "ng_user_profile",
  prefs: "ng_user_prefs",
  recs: "ng_user_recs",
  chat: "ng_demo_chat",
};

export const loadSupportData = () => ({
  user: JSON.parse(localStorage.getItem(LS_KEYS.user) || "null"),
  prefs: JSON.parse(localStorage.getItem(LS_KEYS.prefs) || "null"),
  recs: JSON.parse(localStorage.getItem(LS_KEYS.recs) || "null"),
  chat: JSON.parse(localStorage.getItem(LS_KEYS.chat) || "[]"),
});
