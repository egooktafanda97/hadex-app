import { auth } from "@/auth";
import { createBooking } from "@/services/booking.service";
import { ZodError } from "zod";
export async function POST(request:Request){const session=await auth();if(!session?.user?.id)return Response.json({error:"Silakan masuk terlebih dahulu"},{status:401});if(session.user.role!=="customer"&&session.user.role!=="operator"&&session.user.role!=="admin")return Response.json({error:"Akses ditolak"},{status:403});try{return Response.json(createBooking(session.user.id,await request.json()),{status:201})}catch(error){const message=error instanceof ZodError?error.issues[0]?.message:error instanceof Error?error.message:"Booking gagal";return Response.json({error:message},{status:400})}}
