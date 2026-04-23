import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const response = await fetch("https://smartpark.htl-projekt.com/api_login.php", {
      method: "POST",
      body: formData,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("Failed to parse login response JSON", jsonError);
      return NextResponse.json(
        { status: "error", message: "Invalid response from login server" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      status: response.ok ? 200 : response.status,
    });
  } catch (error) {
    console.error("/api/login error:", error);
    return NextResponse.json(
      { status: "error", message: "Network or server error" },
      { status: 500 }
    );
  }
}
