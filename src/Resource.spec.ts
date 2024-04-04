import { BaseProperty, Filter } from "adminjs";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Database } from "./Database.js";
import { Property } from "./Property.js";
import { Resource } from "./Resource.js";
import { ResourceMetadata } from "./metadata/index.js";
import { getDatabase } from "./test/db.js";
import {
  buildPost,
  buildProfile,
  buildUser,
  getAdapter,
} from "./test/fixtures.js";
import type { User } from "./test/types.js";

const dbConfig = getDatabase();

async function getResource(table: string) {
  const adapter = getAdapter(dbConfig.config);
  const databaseMetadata = await adapter.init();
  return new Database(databaseMetadata).resource(table);
}

describe("Resource", () => {
  let database: Database;

  beforeAll(async () => {
    const adapter = getAdapter(dbConfig.config);
    const databaseMetadata = await adapter.init();
    database = new Database(databaseMetadata);
  });

  describe(".isAdapterFor", () => {
    it("returns true when resource metadata class is given", () => {
      const resourceMetadata = new ResourceMetadata(
        dbConfig.config.dialect,
        dbConfig.knex,
        dbConfig.config.database,
        dbConfig.config.schema,
        "user",
        [
          new Property({
            isEditable: false,
            isId: true,
            isEnum: false,
            isNullable: false,
            name: "id",
            position: 0,
            referencedTable: null,
            type: "number",
          }),
        ],
      );

      expect(Resource.isAdapterFor(resourceMetadata)).toEqual(true);
    });

    it("returns false for any other kind of resources", () => {
      expect(Resource.isAdapterFor({} as ResourceMetadata)).toEqual(false);
    });
  });

  describe("#databaseType", () => {
    it("returns database dialect", async () => {
      expect(database.resource("user").databaseType()).toEqual(
        dbConfig.config.databaseType,
      );
    });
  });

  describe("#id", () => {
    it("returns the name of the entity", async () => {
      expect(database.resource("post").id()).toEqual("post");
    });
  });

  describe("#properties", () => {
    it("returns all the properties", async () => {
      expect(database.resource("post").properties()).toHaveLength(9);
    });
  });

  describe("#property", () => {
    it("returns selected property", async () => {
      const property = database.resource("post").property("id");
      expect(property).toBeInstanceOf(BaseProperty);
    });
  });

  describe("#count", () => {
    it("returns number of records", async () => {
      const count = await database.resource("post").count({} as Filter);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("#create", () => {
    it("returns params", async () => {
      const user = await database.resource("user").create(buildUser());

      expect(user.id).toBeDefined();
    });
  });

  describe("#update", () => {
    it("updates record name", async () => {
      const user = await database.resource("user").create(buildUser());
      const post = await database
        .resource("post")
        .create(buildPost({ id: user.id! }));
      const record = await database.resource("post").findOne(post.id);
      const title = "Michael";

      await database.resource("post").update(record?.id() as string, {
        title,
      });
      const recordInDb = await database
        .resource("post")
        .findOne(record?.id() as string);
      expect(recordInDb?.get("title")).toEqual(title);
    });
  });

  describe("#findOne", () => {
    it("finds record by id", async () => {
      const userObject = buildUser();
      await database.resource("user").create(userObject);
      const record = await database.resource("user").findOne(userObject.id!);
      expect(record?.params).toMatchObject(userObject);
    });
  });

  describe("#findMany", () => {
    it("finds records by ids", async () => {
      const users = await Promise.all([
        database.resource("user").create(buildUser()),
        database.resource("user").create(buildUser()),
      ]);

      const records = await database
        .resource("user")
        .findMany(users.map((u) => u.id));

      const insertedRecordIds = records.map((r) => r.id());
      expect(insertedRecordIds).toContain(users[0].id);
      expect(insertedRecordIds).toContain(users[1].id);
    });
  });

  describe("#find", () => {
    let users: User[];

    beforeAll(async () => {
      users = [
        await database.resource("user").create(buildUser()),
        await database.resource("user").create(buildUser()),
      ] as User[];
    });

    it("finds by record name", async () => {
      const filter = new Filter(
        { name: users[0].name },
        database.resource("user"),
      );

      const record = await database.resource("user").find(filter, {});

      expect(record[0]?.get("name")).toEqual(users[0].name);
      expect(record[0]?.get("email")).toEqual(users[0].email);
      expect(record.length).toEqual(1);
    });

    it("finds by record uuid column", async () => {
      const profileResource = await getResource("profile");
      const profile = await profileResource.create(
        buildProfile({ id: users[0].id! }),
      );
      await profileResource.create(buildProfile({ id: users[1].id! }));
      const filter = new Filter(
        {
          id: profile.id,
        },
        profileResource,
      );

      const record = await profileResource.find(filter, {});
      expect(record[0].params).toMatchObject(profile);
      expect(record.length).toEqual(1);
    });

    it("finds by enum column", async () => {
      const postResource = await getResource("post");
      const post = await postResource.create({
        ...buildPost({ id: users[0].id! }),
        status: "INACTIVE",
      });

      const filter = new Filter({ status: post.status }, postResource);
      const records = await postResource.find(filter);
      expect(records).toSatisfyAll(
        (record) => record.get("status") === post.status,
      );
      expect(records.length).toBeGreaterThanOrEqual(1);
    });
  });

  // describe.skip("references", () => {
  //   let profile: Profile
  //   let user: User
  //   let profileResource: Resource;
  //
  //   beforeEach(async () => {
  //     user = await database.resource("user").create(buildUser()) as User;
  //     profileResource = await getResource("profile");
  //   });
  //
  //   it("creates new resource", async () => {
  //     profile = await profileResource.create({
  //       bio: "Example",
  //       user: user.id,
  //     });
  //
  //     expect(profile.user).toEqual(user.id);
  //   });
  // });

  describe("#delete", () => {
    let user: User;

    beforeEach(async () => {
      user = (await database.resource("user").create(buildUser())) as User;
    });

    it("deletes the resource", async () => {
      await database.resource("user").delete(user.id!);
      expect(await database.resource("user").findOne(user.id!)).toBe(null);
    });
  });
});
