import { describe, it, expect } from "vitest";
import { createId } from "@paralleldrive/cuid2";
import { transformUser, transformSession } from "../migration/02-migrate-users.js";
import { transformGame } from "../migration/03-migrate-games.js";

describe("Migration Data Transformation", () => {
  describe("transformUser", () => {
    it("should correctly transform a SQLite user to a PostgreSQL user", () => {
      const sqliteUser = {
        id: "user_sqlite_id_1",
        username: "testuser",
        email: "test@example.com",
        password_hash: "hashed_password",
        role: "admin",
        is_active: true,
        bio: "A test bio.",
        created_at: "2023-01-01T10:00:00.000Z",
        updated_at: "2023-01-02T12:00:00.000Z",
        last_login: "2023-01-05T14:00:00.000Z",
      };

      const pgUser = transformUser(sqliteUser);

      expect(pgUser.name).toBe(sqliteUser.username);
      expect(pgUser.email).toBe(sqliteUser.email);
      expect(pgUser.password).toBe(sqliteUser.password_hash);
      expect(pgUser.role).toBe("admin");
      expect(pgUser.status).toBe("active");
      expect(pgUser.bio).toBe("A test bio.");
      expect(pgUser.createdAt).toEqual(new Date(sqliteUser.created_at));
      expect(pgUser.lastLogin).toEqual(new Date(sqliteUser.last_login));
    });

    it("should handle missing optional fields for a user", () => {
        const sqliteUser = {
            id: "user_sqlite_id_2",
            username: "minimaluser",
            email: "minimal@example.com",
            password_hash: "hashed_password2",
            is_active: false,
            created_at: "2023-02-01T10:00:00.000Z",
            updated_at: "2023-02-02T12:00:00.000Z",
        };

        const pgUser = transformUser(sqliteUser);

        expect(pgUser.role).toBe("user"); // Default role
        expect(pgUser.status).toBe("suspended");
        expect(pgUser.bio).toBeNull();
        expect(pgUser.lastLogin).toBeNull();
    });
  });

  describe("transformSession", () => {
    it("should correctly transform a SQLite session", () => {
        const sqliteSession = {
            id: "session_sqlite_id_1",
            user_id: "user_sqlite_id_1",
            expires_at: "2024-01-01T10:00:00.000Z",
            created_at: "2023-12-01T10:00:00.000Z",
            ip_address: "127.0.0.1",
            user_agent: "Test Agent",
            is_active: true,
        };
        const userIdMapping = new Map([["user_sqlite_id_1", "new_cuid_user_1"]]);

        const pgSession = transformSession(sqliteSession, userIdMapping);

        expect(pgSession.userId).toBe("new_cuid_user_1");
        expect(pgSession.expiresAt).toEqual(new Date(sqliteSession.expires_at));
        expect(pgSession.ipAddress).toBe("127.0.0.1");
    });
  });

  describe("transformGame", () => {
    it("should correctly transform a SQLite game to a PostgreSQL game", () => {
        const sqliteGame = {
            id: "game_sqlite_id_1",
            title: "Test Game Title",
            image_url: "http://example.com/image.png",
            release_date: "2022-05-20T00:00:00.000Z",
            genre: "Action",
            platform: "PC",
            description: "A great game.",
            rating: 9.5,
            developer: "Test Dev",
            publisher: "Test Pub",
            created_at: "2023-01-01T10:00:00.000Z",
            updated_at: "2023-01-02T12:00:00.000Z",
        };

        const pgGame = transformGame(sqliteGame);

        expect(pgGame.name).toBe(sqliteGame.title);
        expect(pgGame.cover).toBe(sqliteGame.image_url);
        expect(pgGame.firstReleaseDate).toEqual(new Date(sqliteGame.release_date));
        expect(pgGame.genres).toEqual(["Action"]);
        expect(pgGame.platforms).toEqual(["PC"]);
        expect(pgGame.summary).toBe(sqliteGame.description);
        expect(pgGame.rating).toBe(9.5);
    });
  });
});

