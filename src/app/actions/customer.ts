"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { profileSchema } from "@/schemas/master-data";
import type { ActionResult } from "@/app/actions/master-data";

export async function updateProfileAction(_:ActionResult|undefined,form:FormData):Promise<ActionResult>{try{const user=await requireUser(["customer"]);const data=profileSchema.parse({name:form.get("name"),phone:form.get("phone")});const old=db.prepare(`SELECT name,phone FROM users WHERE id=?`).get(user.id);db.prepare(`UPDATE users SET name=?,phone=?,updated_at=? WHERE id=?`).run(data.name,data.phone,new Date().toISOString(),user.id);audit("profile.updated","User",user.id,user.id,old,data);revalidatePath("/customer/profile");return {ok:true,message:"Profil diperbarui"}}catch(error){return {ok:false,message:error instanceof Error?error.message:"Profil gagal diperbarui"}}}
export async function cancelBookingAction(form:FormData){const user=await requireUser(["customer"]);const id=String(form.get("id")??"");const time=new Date().toISOString();db.transaction(()=>{const booking=db.prepare(`SELECT * FROM bookings WHERE id=? AND user_id=?`).get(id,user.id) as {status:string}|undefined;if(!booking||booking.status!=="pending_payment")throw new Error("Booking tidak dapat dibatalkan");db.prepare(`UPDATE bookings SET status='cancelled',cancelled_at=?,updated_at=? WHERE id=?`).run(time,time,id);db.prepare(`UPDATE payments SET status='expired',updated_at=? WHERE booking_id=? AND status IN ('unpaid','pending')`).run(time,id);db.prepare(`UPDATE trip_seats SET status='available',held_by_booking_id=NULL,held_until=NULL WHERE held_by_booking_id=? AND status='held'`).run(id);audit("booking.cancelled","Booking",id,user.id,booking,{status:"cancelled"})})();revalidatePath("/customer/bookings")}
