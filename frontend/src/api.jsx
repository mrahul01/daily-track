const BASE_URL = "https://candied-unpicked-quiet.ngrok-free.dev";

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emailID: email,
      password: password
    })
  });

  return res.json();
};