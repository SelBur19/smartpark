export const loginUser = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const response = await fetch(
    "http://smartpark.htl-projekt.com/api_login.php",
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
};
