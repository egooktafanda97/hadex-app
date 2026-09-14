import "server-only";
import crypto from "node:crypto";
import { db } from "@/lib/db";

export function audit(action:string, modelType:string, modelId:string|null, userId:string|null, oldValues?:unknown, newValues?:unknown) {
  db.prepare(`INSERT INTO audit_logs (id,user_id,action,model_type,model_id,old_values,new_values,created_at) VALUES (?,?,?,?,?,?,?,?)`).run(
    crypto.randomUUID(), userId, action, modelType, modelId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null, new Date().toISOString()
  );
}
