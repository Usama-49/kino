import { connectToDB } from "@/lib/db";
import userModel from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email & Password are required!" }, { status: 400 });
    }
    await connectToDB();
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User Already Registered!" }, { status: 400 });
    }
    const user = await userModel.create({
      email,
      password,
      provider: "credentials",
    });
    return NextResponse.json({ message: "User Registered Successfully!", user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to register user!" }, { status: 500 });
  }
}
