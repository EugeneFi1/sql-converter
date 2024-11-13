import { SqlConverter } from "../index";
import { FIELD_METADATA } from "../mock-data/fields";
import { TABLE_METADATA } from "../mock-data/tables";

const stringSqlExample = [
  "SELECT first_name, last_name FROM users WHERE id > 1 ORDER BY first_name",
  "SELECT departments.name, avg(salary) FROM users GROUP BY departments.name",
  "SELECT id, title, owner.id, watchers.id FROM tasks",
  "SELECT id, title, owner.id AS 'owner.id', watchers.id FROM tasks RIGHT JOIN users AS owner ON tasks.owner_id = owner.id",
];

const sqlGenerator = new SqlConverter({
  tables: TABLE_METADATA,
  fields: FIELD_METADATA,
});

const stringSql = stringSqlExample[1];

console.log(sqlGenerator.convert(stringSql));
