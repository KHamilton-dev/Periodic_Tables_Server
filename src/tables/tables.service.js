const knex = require('../db/connection');

function create(table) {
  return knex("tables")
    .insert(table)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

function read(table_id) {
  return knex("tables").select('*').where({ table_id }).first();
}

function readReservationId(reservation_id) {
  return knex("reservations")
  .select('*')
  .where({ reservation_id })
  .first();
}

function update(table_id, data) {
  return knex("tables")
    .where({ table_id })
    .update(data, '*')
    .then((createdRecord) => createdRecord[0]);
}

function destroy(table_id, data) {
  return knex("tables")
    .select('*')
    .where({ table_id })
    .update(data, '*')
}

function list() {
  return knex("tables").select('*').orderBy('table_name', 'asc');
}

module.exports = {
  create,
  read,
  readReservationId,
  update,
  destroy,
  list,
};