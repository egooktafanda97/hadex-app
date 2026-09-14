"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireUser } from "@/lib/dal";
import { cancelTrip, saveBus, saveLocation, saveRoute, saveTrip, saveUser, toggleActive, toggleBusDeleted } from "@/services/master-data.service";

export type ActionResult = { ok: boolean; message: string };
const value = (form: FormData, name: string) => String(form.get(name) ?? "");
async function admin() { return requireUser(["admin"]) }
function result(error: unknown): ActionResult {
    const message = error instanceof ZodError
        ? error.issues[0]?.message ?? "Data tidak valid"
        : error instanceof Error ? error.message : "Operasi gagal";
    return { ok: false, message };
}

export async function saveBusAction(_: ActionResult | undefined, form: FormData) { try { const u = await admin(); saveBus(u.id, value(form, "id") || undefined, { code: value(form, "code"), name: value(form, "name"), plateNumber: value(form, "plateNumber"), capacity: value(form, "capacity") }); revalidatePath("/admin/buses"); return { ok: true, message: "Bus tersimpan" } } catch (e) { return result(e) } }
export async function saveLocationAction(_: ActionResult | undefined, form: FormData) { try { const u = await admin(); saveLocation(u.id, value(form, "id") || undefined, { name: value(form, "name"), city: value(form, "city"), address: value(form, "address") }); revalidatePath("/admin/locations"); return { ok: true, message: "Lokasi tersimpan" } } catch (e) { return result(e) } }
export async function saveRouteAction(_: ActionResult | undefined, form: FormData) { try { const u = await admin(); saveRoute(u.id, value(form, "id") || undefined, { originId: value(form, "originId"), destinationId: value(form, "destinationId"), durationMinutes: value(form, "durationMinutes"), distanceKm: value(form, "distanceKm") }); revalidatePath("/admin/routes"); return { ok: true, message: "Rute tersimpan" } } catch (e) { return result(e) } }
export async function saveTripAction(_: ActionResult | undefined, form: FormData) { try { const u = await admin(); saveTrip(u.id, value(form, "id") || undefined, { tripCode: value(form, "tripCode"), busId: value(form, "busId"), routeId: value(form, "routeId"), departureAt: new Date(value(form, "departureAt")).toISOString(), arrivalAt: new Date(value(form, "arrivalAt")).toISOString(), fare: value(form, "fare"), status: value(form, "status") || undefined }); revalidatePath("/admin/trips"); return { ok: true, message: "Trip tersimpan" } } catch (e) { return result(e) } }
export async function saveUserAction(_: ActionResult | undefined, form: FormData) { try { const u = await admin(); await saveUser(u.id, value(form, "id") || undefined, { name: value(form, "name"), email: value(form, "email"), phone: value(form, "phone"), role: value(form, "role"), password: value(form, "password") || undefined }); revalidatePath("/admin/users"); return { ok: true, message: "User tersimpan" } } catch (e) { return result(e) } }
export async function toggleActiveAction(form: FormData) { const u = await admin(); const table = value(form, "table") as "buses" | "locations" | "routes" | "users"; if (!["buses", "locations", "routes", "users"].includes(table)) throw new Error("Entitas tidak valid"); toggleActive(u.id, table, value(form, "model"), value(form, "id")); revalidatePath(value(form, "path")) }
export async function toggleBusDeletedAction(form: FormData) { const u = await admin(); toggleBusDeleted(u.id, value(form, "id")); revalidatePath("/admin/buses"); revalidatePath("/admin/trips") }
export async function cancelTripAction(form: FormData) { const u = await admin(); cancelTrip(u.id, value(form, "id")); revalidatePath("/admin/trips") }
