// src/app/api/consumption/route.ts
import { connectDB } from "@/app/services/server/mongodb";
import { ConsumptionHabit } from "@/app/models/ConsumptionHabit";
import { fail, ok } from "@/app/lib/api-helpers";
import { consumptionUpsertSchema } from "@/app/types/api";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");
    const category = searchParams.get("category") ?? undefined;
    
    // Build query - try multiple approaches to find user data
    let items: any[] = [];
    
    if (userEmail) {
      console.log('🔍 API: Searching for userEmail:', userEmail);
      // Try to find user first to get userId using MongoDB native
      const db = await connectDB();
      const usersCollection = db.collection("Users");
      
      // First, let's see all users in the database
      const allUsers = await usersCollection.find().toArray();
      console.log('📋 API: All users in database:', allUsers.map((u: any) => ({ id: u._id, email: u.email })));
      
      const user = await usersCollection.findOne({ email: userEmail });
      console.log('👤 API: Found user:', user ? { id: user._id, email: user.email } : 'null');
      console.log('👤 API: Found user:', user ? { id: (user as any)._id, email: (user as any).email } : 'null');
      
      if (user) {
        // Search by userId from the user document
        const q: any = { userId: user._id };
        if (category) q.category = category;
        console.log('🔍 API: Query for consumption:', q);
        
        // Use native MongoDB instead of Mongoose
        const consumptionCollection = db.collection("ConsumptionHabits");
        const rawItems = await consumptionCollection.find(q).toArray();
        console.log('📊 API: Found consumption items:', rawItems.length);
        
        items = rawItems;
        
        // Transform data to match expected format
        items = items.map(item => ({
          ...item,
          month: item.date ? new Date(item.date).getMonth() + 1 : item.month,
          year: item.date ? new Date(item.date).getFullYear() : item.year,
          category: item.category === 'Transport' ? 'Transportation' : item.category
        }));
        console.log('✅ API: Transformed items:', items.length, 'items');
      } else {
        console.log('❌ API: User not found for email:', userEmail);
      }
    } else if (userId) {
      const q: any = { userId };
      if (category) q.category = category;
      items = await ConsumptionHabit.find(q).lean();
      
      // Transform data
      items = items.map(item => ({
        ...item,
        month: item.date ? new Date(item.date).getMonth() + 1 : item.month,
        year: item.date ? new Date(item.date).getFullYear() : item.year,
        category: item.category === 'Transport' ? 'Transportation' : item.category
      }));
    }
    
    console.log('🚀 API: Returning items:', items.length, 'total items');
    return ok(items);
  } catch (error) {
    console.log("❌ API Error:", error);
    console.log("MongoDB not available, returning empty data");
    // Return empty array instead of error when DB is not available
    return ok([]);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Ensure userEmail is included
    if (!body.userEmail) {
      return fail("userEmail is required", 400);
    }
    
    const item = await ConsumptionHabit.create(body);
    return ok(item, 201);
  } catch (e) {
    // likely unique index violation on (userEmail,category,year,month)
    return fail("Failed to create consumption", 500, (e as Error).message);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...rest } = body || {};
    if (!_id) return fail("Missing _id", 400);
    const updated = await ConsumptionHabit.findByIdAndUpdate(_id, rest, { new: true });
    return ok(updated);
  } catch {
    return fail("Failed to update consumption", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);
    await ConsumptionHabit.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch {
    return fail("Failed to delete consumption", 500);
  }
}
