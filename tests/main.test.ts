import { SqlConverter } from "..";
import { FIELD_METADATA } from "../mock-data/fields";
import { TABLE_METADATA } from "../mock-data/tables";

/**
 * To add new test for your query add new array into this const in following format:
 * [<intermediate transaction language string>, <expected SQL-query>]
 */
const QUERIES_TO_TEST = [
  // test SELECT from one table
  [
    "SELECT first_name, last_name FROM users WHERE id > 1 ORDER BY first_name",
    `SELECT "first_name", "last_name" FROM "users" WHERE "id" > 1 ORDER BY "first_name" ASC`,
  ],
  // test with avg()
  [
    "SELECT departments.name, avg(salary) FROM users GROUP BY departments.name",
    'SELECT "departments"."name" AS "departments.name", AVG("users"."salary") AS "users.salary" FROM "users" LEFT JOIN "users_departments" ON "users"."id" = "users_departments"."users_id" LEFT JOIN "departments" AS "departments" ON "users_departments"."departments_id" = "departments"."id" GROUP BY "departments"."name"',
  ],
  // test SELECT from more than one table
  [
    "SELECT id, title, owner.id, watchers.id FROM tasks",
    'SELECT "tasks"."id", "tasks"."title", "owner"."id" AS "owner.id", "watchers"."id" AS "watchers.id" FROM "tasks" LEFT JOIN "users" AS "owner" ON "tasks"."owner_id" = "owner"."id" LEFT JOIN "tasks_watchers" ON "tasks"."id" = "tasks_watchers"."tasks_id" LEFT JOIN "users" AS "watchers" ON "tasks_watchers"."watchers_id" = "watchers"."id"',
  ],
  // test custom JOIN (RIGHT JOIN)
  [
    "SELECT id, title, owner.id AS 'owner.id', watchers.id FROM tasks RIGHT JOIN users AS owner ON tasks.owner_id = owner.id",
    'SELECT "tasks"."id", "tasks"."title", "owner"."id" AS "owner.id", "watchers"."id" AS "watchers.id" FROM "tasks" RIGHT JOIN "users" AS "owner" ON "tasks"."owner_id" = "owner"."id" LEFT JOIN "tasks_watchers" ON "tasks"."id" = "tasks_watchers"."tasks_id" LEFT JOIN "users" AS "watchers" ON "tasks_watchers"."watchers_id" = "watchers"."id"',
  ],
  // test nested SELECT
  [
    "SELECT tasks.id FROM (SELECT id, title, owner.id, watchers.id FROM tasks)",
    'SELECT "tasks"."id" FROM (SELECT "tasks"."id", "tasks"."title", "owner"."id" AS "owner.id", "watchers"."id" AS "watchers.id" FROM "tasks" LEFT JOIN "users" AS "owner" ON "tasks"."owner_id" = "owner"."id" LEFT JOIN "tasks_watchers" ON "tasks"."id" = "tasks_watchers"."tasks_id" LEFT JOIN "users" AS "watchers" ON "tasks_watchers"."watchers_id" = "watchers"."id")',
  ],
];

const converter = new SqlConverter({
  tables: TABLE_METADATA,
  fields: FIELD_METADATA,
});

QUERIES_TO_TEST.forEach((query) => {
  test(query[0], () => expect(converter.convert(query[0])).toEqual(query[1]));
});
