import { connectDB } from "@/app/services/server/mongodb";
import { User } from "@/app/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Failed to load user" }, { status: 500 });
  }
}
