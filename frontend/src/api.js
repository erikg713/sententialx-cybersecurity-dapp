const API_URL = "http://localhost:5000"; // replace with deployed backend

export const apiLogin = async (userId) => {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  return res.json();
};

export const apiPay = async (userId, amount) => {
  const res = await fetch(`${API_URL}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, amount })
  });
  return res.json();
};

export const apiKYC = async (userId) => {
  const res = await fetch(`${API_URL}/kyc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  return res.json();
};
