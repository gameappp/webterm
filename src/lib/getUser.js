import { baseURL } from "@/services/API";

export async function getUser() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const userRes = await fetch(`${baseURL}/user/userinfo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      console.log("error ok22");

      return null;
    }

    const userData = await userRes.json();

    return userData;
  } catch (error) {
    console.log(error);
  }
}
