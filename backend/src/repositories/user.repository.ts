import { pool } from "../config/database";
import type { User } from "../models/user.model";
import type { UserRole } from "../types";

export async function findByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `SELECT u.id, u.name, u.email, u.password_hash, u.is_active, u.created_at, u.updated_at,
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE u.email = $1
     GROUP BY u.id`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `SELECT u.id, u.name, u.email, u.password_hash, u.is_active, u.created_at, u.updated_at,
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findAll(): Promise<Omit<User, "password_hash">[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.updated_at,
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  );
  return rows;
}

export async function create(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}): Promise<User> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<User>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.email, data.passwordHash],
    );
    const user = rows[0];

    const roleName = data.role ?? "user";
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = $2`,
      [user.id, roleName],
    );

    await client.query("COMMIT");
    return { ...user, roles: [roleName] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function update(
  id: string,
  data: Partial<Pick<User, "name" | "email">>,
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const { rows } = await pool.query<User>(
    `UPDATE users SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${idx}
     RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
    id,
  ]);
  return (rowCount ?? 0) > 0;
}
