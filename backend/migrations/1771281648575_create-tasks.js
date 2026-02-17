/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable(
    "tasks",
    {
      id: {
        type: "serial",
        primaryKey: true,
      },
      title: {
        type: "varchar(255)",
        notNull: true,
      },
      completed: {
        type: "boolean",
        default: false,
      },
      created_at: {
        type: "timestamp with time zone",
        default: pgm.func("current_timestamp"),
      },
    },
    { ifNotExists: true }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("tasks", { ifExists: true });
};
